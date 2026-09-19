package com.sena.sirvelo;

import android.os.Bundle;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

public class DetalleActivity extends AppCompatActivity {

    public static final String MESA_KEY = "MESA_KEY";

    public static final String TOTAL_KEY = "TOTAL_KEY";

    private TextView tvNumeroMesa;

    private TextView tvTotalPedido;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_detalle);

        tvNumeroMesa =
                findViewById(R.id.tv_numero_mesa);

        tvTotalPedido =
                findViewById(R.id.tv_total_pedido);

        Bundle extras =
                getIntent().getExtras();

        if (extras != null) {

            String numeroMesa =
                    extras.getString(MESA_KEY);

            String totalPedido =
                    extras.getString(TOTAL_KEY);

            tvNumeroMesa.setText(
                    "Mesa: " + numeroMesa
            );

            tvTotalPedido.setText(
                    "Total: $" + totalPedido
            );
        }
    }
}