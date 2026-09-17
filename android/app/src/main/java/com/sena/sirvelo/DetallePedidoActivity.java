package com.sena.sirvelo;

import android.os.Bundle;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

public class DetallePedidoActivity extends AppCompatActivity {

    private TextView txtIdPedido;
    private TextView txtMesa;
    private TextView txtMesero;
    private TextView txtDetalle;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_detalle_pedido);

        txtIdPedido =
                findViewById(R.id.txt_id_pedido_detalle);

        txtMesa =
                findViewById(R.id.txt_mesa_detalle);

        txtMesero =
                findViewById(R.id.txt_mesero_detalle);

        txtDetalle =
                findViewById(R.id.txt_detalle_pedido);

        String idPedido =
                getIntent()
                        .getExtras()
                        .getString("id_pedido");

        String mesa =
                getIntent()
                        .getExtras()
                        .getString("mesa");

        String mesero =
                getIntent()
                        .getExtras()
                        .getString("mesero");

        String detalle =
                getIntent()
                        .getExtras()
                        .getString("detalle");

        txtIdPedido.setText(
                "Pedido #" + idPedido
        );

        txtMesa.setText(
                "Mesa: " + mesa
        );

        txtMesero.setText(
                "Mesero: " + mesero
        );

        txtDetalle.setText(
                "Detalle: " + detalle
        );
    }
}