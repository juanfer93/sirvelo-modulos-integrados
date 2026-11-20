package com.sena.sirvelo;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;

public class PedidosActivity extends AppCompatActivity {

    private static final String TAG = "Lifecycle";

    private ListView listViewPedidos;

    private TextView mensajePedidos;

    private Button botonNuevoPedido;

    private ArrayList<JSONObject> listaPedidos;

    private PedidoAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Log.d(TAG, "PedidosActivity - onCreate");

        setContentView(R.layout.activity_pedidos);

        listViewPedidos =
                findViewById(R.id.listViewPedidos);

        mensajePedidos = findViewById(R.id.txtPedidosVacios);
        mostrarEstadoPedidos("Cargando pedidos...");

        botonNuevoPedido =
                findViewById(R.id.btnNuevoPedido);

        botonNuevoPedido.setOnClickListener(v -> mostrarFormularioNuevoPedido());

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

        mostrarEstadoPedidos("Cargando pedidos...");

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

            mostrarEstadoPedidos("No se encontró el token de sesión. Inicia sesión nuevamente.");

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

                        if (nuevosPedidos.isEmpty()) {
                            mostrarEstadoPedidos(
                                    "No hay pedidos todavía. Pulsa Nuevo pedido para registrar el primero."
                            );
                        } else {
                            mensajePedidos.setVisibility(View.GONE);
                            listViewPedidos.setVisibility(View.VISIBLE);
                        }
                    });

                } else {

                    runOnUiThread(() -> {

                        mostrarEstadoPedidos(
                                "Error al obtener pedidos: HTTP " + codigoRespuesta
                        );

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

                    mostrarEstadoPedidos("No se pudo conectar con el servidor.");

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

    private void mostrarEstadoPedidos(String mensaje) {
        mensajePedidos.setText(mensaje);
        mensajePedidos.setVisibility(View.VISIBLE);
        listViewPedidos.setVisibility(View.GONE);
    }

    private void mostrarFormularioNuevoPedido() {
        LinearLayout formulario = new LinearLayout(this);
        formulario.setOrientation(LinearLayout.VERTICAL);
        int margen = (int) (20 * getResources().getDisplayMetrics().density);
        formulario.setPadding(margen, margen / 2, margen, 0);

        EditText campoMesa = crearCampo("Mesa", false);
        EditText campoMesero = crearCampo("Mesero", false);
        EditText campoDetalle = crearCampo("Detalle del pedido", true);

        formulario.addView(campoMesa);
        formulario.addView(campoMesero);
        formulario.addView(campoDetalle);

        AlertDialog dialogo = new AlertDialog.Builder(this)
                .setTitle("Nuevo pedido")
                .setView(formulario)
                .setNegativeButton("Cancelar", null)
                .setPositiveButton("Crear", null)
                .create();

        dialogo.setOnShowListener(ignored -> dialogo.getButton(AlertDialog.BUTTON_POSITIVE)
                .setOnClickListener(v -> {
                    String mesa = campoMesa.getText().toString().trim();
                    String mesero = campoMesero.getText().toString().trim();
                    String detalle = campoDetalle.getText().toString().trim();

                    if (mesa.isEmpty() || mesero.isEmpty()) {
                        Toast.makeText(
                                this,
                                "Completa la mesa y el nombre del mesero",
                                Toast.LENGTH_SHORT
                        ).show();
                        return;
                    }

                    dialogo.dismiss();
                    crearPedido(mesa, mesero, detalle);
                }));

        dialogo.show();
    }

    private EditText crearCampo(String pista, boolean multilinea) {
        EditText campo = new EditText(this);
        campo.setHint(pista);
        campo.setSingleLine(!multilinea);
        if (multilinea) {
            campo.setMinLines(2);
            campo.setMaxLines(4);
        }
        campo.setLayoutParams(new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        ));
        return campo;
    }

    private void crearPedido(String mesa, String mesero, String detalle) {
        SharedPreferences preferencias = getSharedPreferences(
                "SirveloPrefs",
                MODE_PRIVATE
        );
        String token = preferencias.getString("token", null);

        if (token == null || token.isEmpty()) {
            Toast.makeText(this, "Inicia sesión para crear un pedido", Toast.LENGTH_SHORT).show();
            return;
        }

        botonNuevoPedido.setEnabled(false);

        new Thread(() -> {
            HttpURLConnection conexion = null;
            String mensajeError = "No se pudo crear el pedido";
            boolean creado = false;

            try {
                URL url = new URL("http://10.0.2.2:4000/api/pedidos");
                conexion = (HttpURLConnection) url.openConnection();
                conexion.setRequestMethod("POST");
                conexion.setRequestProperty("Authorization", "Bearer " + token);
                conexion.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                conexion.setRequestProperty("Accept", "application/json");
                conexion.setDoOutput(true);
                conexion.setConnectTimeout(5000);
                conexion.setReadTimeout(5000);

                JSONObject cuerpo = new JSONObject();
                cuerpo.put("mesa", mesa);
                cuerpo.put("mesero", mesero);
                cuerpo.put("detalle", detalle);

                try (OutputStream salida = conexion.getOutputStream()) {
                    salida.write(cuerpo.toString().getBytes("UTF-8"));
                }

                int codigoRespuesta = conexion.getResponseCode();
                BufferedReader lector = new BufferedReader(new InputStreamReader(
                        codigoRespuesta >= 200 && codigoRespuesta < 300
                                ? conexion.getInputStream()
                                : conexion.getErrorStream()
                ));
                StringBuilder respuesta = new StringBuilder();
                String linea;
                while ((linea = lector.readLine()) != null) {
                    respuesta.append(linea);
                }
                lector.close();

                if (codigoRespuesta == HttpURLConnection.HTTP_CREATED) {
                    creado = true;
                } else {
                    mensajeError = new JSONObject(respuesta.toString())
                            .optString("mensaje", "Error al crear el pedido: HTTP " + codigoRespuesta);
                }
            } catch (Exception e) {
                Log.e("PedidosAPI", "Error al crear pedido", e);
            } finally {
                if (conexion != null) {
                    conexion.disconnect();
                }
            }

            boolean resultado = creado;
            String mensaje = mensajeError;
            runOnUiThread(() -> {
                botonNuevoPedido.setEnabled(true);
                if (resultado) {
                    Toast.makeText(this, "Pedido creado correctamente", Toast.LENGTH_SHORT).show();
                    cargarPedidos();
                } else {
                    Toast.makeText(this, mensaje, Toast.LENGTH_LONG).show();
                }
            });
        }).start();
    }
}
