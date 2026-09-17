package com.sena.sirvelo;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.widget.ListView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;

public class PedidosActivity extends AppCompatActivity {

    private static final String TAG = "Lifecycle";

    private ListView listViewPedidos;

    private ArrayList<JSONObject> listaPedidos;

    private PedidoAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Log.d(TAG, "PedidosActivity - onCreate");

        setContentView(R.layout.activity_pedidos);

        listViewPedidos =
                findViewById(R.id.listViewPedidos);

        listaPedidos =
                new ArrayList<>();

        adapter =
                new PedidoAdapter(
                        this,
                        listaPedidos
                );

        listViewPedidos.setAdapter(adapter);
    }

    @Override
    protected void onResume() {
        super.onResume();

        Log.d(TAG, "PedidosActivity - onResume");

        cargarPedidos();
    }

    @Override
    protected void onPause() {
        super.onPause();

        Log.d(TAG, "PedidosActivity - onPause");
    }

    @Override
    protected void onStop() {
        super.onStop();

        Log.d(TAG, "PedidosActivity - onStop");
    }

    private void cargarPedidos() {

        SharedPreferences preferencias =
                getSharedPreferences(
                        "SirveloPrefs",
                        MODE_PRIVATE
                );

        String token =
                preferencias.getString(
                        "token",
                        null
                );

        if (token == null || token.isEmpty()) {

            Toast.makeText(
                    this,
                    "No se encontró el token de sesión",
                    Toast.LENGTH_SHORT
            ).show();

            return;
        }

        new Thread(() -> {

            HttpURLConnection conexion = null;

            try {

                URL url =
                        new URL(
                                "http://10.0.2.2:4000/api/pedidos"
                        );

                conexion =
                        (HttpURLConnection)
                                url.openConnection();

                conexion.setRequestMethod("GET");

                conexion.setRequestProperty(
                        "Authorization",
                        "Bearer " + token
                );

                conexion.setRequestProperty(
                        "Accept",
                        "application/json"
                );

                conexion.setConnectTimeout(5000);
                conexion.setReadTimeout(5000);

                int codigoRespuesta =
                        conexion.getResponseCode();

                BufferedReader lector;

                if (codigoRespuesta >= 200 &&
                        codigoRespuesta < 300) {

                    lector =
                            new BufferedReader(
                                    new InputStreamReader(
                                            conexion.getInputStream()
                                    )
                            );

                } else {

                    lector =
                            new BufferedReader(
                                    new InputStreamReader(
                                            conexion.getErrorStream()
                                    )
                            );
                }

                StringBuilder respuesta =
                        new StringBuilder();

                String linea;

                while ((linea = lector.readLine()) != null) {

                    respuesta.append(linea);
                }

                lector.close();

                if (codigoRespuesta == 200) {

                    JSONArray pedidos =
                            new JSONArray(
                                    respuesta.toString()
                            );

                    ArrayList<JSONObject>
                            nuevosPedidos =
                            new ArrayList<>();

                    for (int i = 0;
                         i < pedidos.length();
                         i++) {

                        nuevosPedidos.add(
                                pedidos.getJSONObject(i)
                        );
                    }

                    runOnUiThread(() -> {

                        listaPedidos.clear();

                        listaPedidos.addAll(
                                nuevosPedidos
                        );

                        adapter.notifyDataSetChanged();
                    });

                } else {

                    runOnUiThread(() -> {

                        Toast.makeText(
                                PedidosActivity.this,
                                "Error al obtener pedidos: HTTP "
                                        + codigoRespuesta,
                                Toast.LENGTH_SHORT
                        ).show();
                    });
                }

            } catch (Exception e) {

                Log.e(
                        "PedidosAPI",
                        "Error al consultar pedidos",
                        e
                );

                runOnUiThread(() -> {

                    Toast.makeText(
                            PedidosActivity.this,
                            "No se pudo conectar con el servidor",
                            Toast.LENGTH_SHORT
                    ).show();
                });

            } finally {

                if (conexion != null) {
                    conexion.disconnect();
                }
            }

        }).start();
    }
}