package com.sena.sirvelo;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import org.json.JSONObject;

import androidx.appcompat.app.AppCompatActivity;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class LoginActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_login);

        // 1. Vinculación mediante IDs de la clase R
        EditText emailField = findViewById(R.id.etEmail);
        EditText passwordField = findViewById(R.id.etPassword);
        Button loginButton = findViewById(R.id.btnLogin);

        // 2. Lógica de captura con intención
        loginButton.setOnClickListener(v -> {

            String email = emailField.getText().toString().trim();
            String password = passwordField.getText().toString().trim();

            // El envío se delega a la capa de datos/infraestructura
            validarCredencialesConServidor(email, password);
        });
    }

    private void validarCredencialesConServidor(String email, String password) {

        // Validación local
        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(
                    this,
                    "Por favor completa todos los campos",
                    Toast.LENGTH_SHORT
            ).show();
            return;
        }

        new Thread(() -> {
            try {

                // Conexión con el servidor local
                URL url = new URL("http://10.0.2.2:4000/api/auth/login");
                HttpURLConnection conexion =
                        (HttpURLConnection) url.openConnection();

                conexion.setRequestMethod("POST");
                conexion.setRequestProperty(
                        "Content-Type",
                        "application/json"
                );
                conexion.setDoOutput(true);

                // Tiempo máximo de espera
                conexion.setConnectTimeout(5000);
                conexion.setReadTimeout(5000);

                // Datos enviados al servidor
                String json =
                        "{\"email\":\"" + email +
                                "\",\"password\":\"" + password + "\"}";

                try (OutputStream salida = conexion.getOutputStream()) {
                    salida.write(json.getBytes("UTF-8"));
                }

                // Código HTTP recibido
                int codigoRespuesta = conexion.getResponseCode();

                BufferedReader lector;

                // Selección del flujo según la respuesta
                if (codigoRespuesta >= 200 && codigoRespuesta < 300) {
                    lector = new BufferedReader(
                            new InputStreamReader(
                                    conexion.getInputStream()
                            )
                    );
                } else {
                    lector = new BufferedReader(
                            new InputStreamReader(
                                    conexion.getErrorStream()
                            )
                    );
                }

                StringBuilder respuesta = new StringBuilder();
                String linea;

                while ((linea = lector.readLine()) != null) {
                    respuesta.append(linea);
                }

                lector.close();

                // Manejo de respuestas del servidor
                if (codigoRespuesta == 200) {

                    try {

                        JSONObject jsonRespuesta =
                                new JSONObject(respuesta.toString());

                        String token =
                                jsonRespuesta.getString("token");

                        SharedPreferences preferencias =
                                getSharedPreferences("SirveloPrefs", MODE_PRIVATE);

                        preferencias.edit()
                                .putString("token", token)
                                .apply();

                        runOnUiThread(() -> {

                            Intent intent =
                                    new Intent(LoginActivity.this, PedidosActivity.class);

                            startActivity(intent);
                            finish();
                        });

                    } catch (Exception e) {

                        runOnUiThread(() ->
                                Toast.makeText(
                                        LoginActivity.this,
                                        "Error procesando la respuesta del servidor",
                                        Toast.LENGTH_SHORT
                                ).show()
                        );
                    }
                }
                // Login correcto.

                else if (codigoRespuesta == 401) {

                    runOnUiThread(() ->
                            Toast.makeText(
                                    LoginActivity.this,
                                    "Error de acceso",
                                    Toast.LENGTH_SHORT
                            ).show()
                    );

                } else {

                    runOnUiThread(() ->
                            Toast.makeText(
                                    LoginActivity.this,
                                    "Servidor fuera de línea",
                                    Toast.LENGTH_SHORT
                            ).show()
                    );
                }

            } catch (Exception e) {

                // Error de conexión, timeout o servidor no disponible
                runOnUiThread(() ->
                        Toast.makeText(
                                LoginActivity.this,
                                "Servidor fuera de línea",
                                Toast.LENGTH_SHORT
                        ).show()
                );
            }
        }).start();
    }
}
