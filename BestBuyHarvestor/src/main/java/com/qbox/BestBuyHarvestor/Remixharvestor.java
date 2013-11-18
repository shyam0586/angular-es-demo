package com.qbox.BestBuyHarvestor;

import io.searchbox.client.JestClient;
import io.searchbox.client.JestClientFactory;
import io.searchbox.client.JestResult;
import io.searchbox.client.config.ClientConfig;
import io.searchbox.core.Bulk;
import io.searchbox.core.Bulk.Builder;
import io.searchbox.core.Index;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Remixharvestor {

	static String baseURL = "http://api.remix.bestbuy.com/v1/products(type=Movie&format%20in%20(DVD,Blu-ray%20Disc))?apiKey=ppefpx73aetp94akn34xcda2&format=json&page=";
	static int totalPages = -1;
	static String host = "ec2-54-200-186-105.us-west-2.compute.amazonaws.com";
	//static String host = "localhost";
	static Integer port = 9200;
	static String index = "products";
	static String type = "movies";
	static String fieds[] = { "releaseDate" , "plot" , "name" , "sku" , "studio" , "format" , "quantityLimit" , "genre" , "salePrice" , 
							"mpaaRating" ,  "addToCartUrl" , "image" };

	static JestClient client = null;

	public static void main(String[] args) throws Exception {
		ClientConfig clientConfig = new ClientConfig.Builder("http://" + host + ":" + port).build();
		JestClientFactory factory = new JestClientFactory();
		factory.setClientConfig(clientConfig);
		client = factory.getObject();
		int i = 1;
		while (totalPages == -1 || i <= totalPages) {
			try{
				JSONArray products = sendGet(i);
				submitToES(products);
			}catch(Exception e){
				System.out.println("Error occured");
				e.printStackTrace();
				Thread.sleep(1000 * 2);
				i--;
			}
			i++;
		}
		System.out.println("Array is " + sendGet(1).toString());
	}

	private static void submitToES(JSONArray products) throws Exception {
		Builder bulkOperation = new Bulk.Builder().defaultIndex(index).defaultType(type);
		for (int j = 0; j < products.length(); j++) {
			JSONObject product = (JSONObject) products.get(j);
			String sku = product.getString("sku");
			product = filterproduct(product);
			String name = product.getString("name");
			JSONObject suggest= new JSONObject();
			suggest.put("input", name.split("[ \t-]+"));
			suggest.put("output", name);
			JSONObject payload= new JSONObject();
			payload.put("sku",  sku);
			suggest.put("payload", payload);
			product.put("suggest", suggest);
			bulkOperation.addAction(new Index.Builder(product.toString()).index(index).type(type).id(sku).build());
		}
		Bulk bulk = bulkOperation.build();
		JestResult bulkResponse = client.execute(bulk);
		if (!bulkResponse.isSucceeded()) {
			System.out.println("Failed at indexing ");
		} else {

			System.out.println("Response is success  " + bulkResponse.getJsonString());
		}
	}

	private static JSONObject filterproduct(JSONObject product) throws JSONException {
		JSONObject filteredProduct = new JSONObject();
		for(String field : Arrays.asList(fieds)){
			if(!product.has(field)){
				continue;
			}
			filteredProduct.put(field,product.get(field));
		}
		return filteredProduct;
	}

	// HTTP GET request
	private static JSONArray sendGet(int page) throws Exception {

		String url = baseURL + page;
		System.out.println("Firing " + url);
		String USER_AGENT = "Mozilla/5.0";
		URL obj = new URL(url);
		HttpURLConnection con = (HttpURLConnection) obj.openConnection();
		con.setRequestMethod("GET");
		con.setRequestProperty("User-Agent", USER_AGENT);
		int responseCode = con.getResponseCode();
		System.out.println("Response Code : " + responseCode);
		BufferedReader in = new BufferedReader(new InputStreamReader(
				con.getInputStream()));
		String inputLine;
		StringBuffer response = new StringBuffer();

		while ((inputLine = in.readLine()) != null) {
			response.append(inputLine);
		}
		JSONObject responseJSON = new JSONObject(response.toString());
		if (totalPages == -1) {
			totalPages = (Integer) responseJSON.get("totalPages");
		}
		return (JSONArray) responseJSON.get("products");
	}

}