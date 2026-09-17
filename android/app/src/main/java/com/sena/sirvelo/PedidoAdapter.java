package com.sena.sirvelo;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import org.json.JSONObject;

import java.util.List;

public class PedidoAdapter extends ArrayAdapter<JSONObject> {

    public PedidoAdapter(
            Context context,
            List<JSONObject> pedidos
    ) {
        super(context, 0, pedidos);
    }

    @Override
    public View getView(
            int position,
            View convertView,
            ViewGroup parent
    ) {

        if (convertView == null) {

            convertView = LayoutInflater
                    .from(getContext())
                    .inflate(
                            R.layout.item_pedido,
                            parent,
                            false
                    );
        }

        TextView txtIdPedido =
                convertView.findViewById(R.id.txt_id_pedido);

        TextView txtMesa =
                convertView.findViewById(R.id.txt_mesa);

        TextView txtMesero =
                convertView.findViewById(R.id.txt_mesero);

        TextView txtDetalle =
                convertView.findViewById(R.id.txt_detalle);

        TextView txtStatus =
                convertView.findViewById(R.id.txt_status);

        TextView txtTotal =
                convertView.findViewById(R.id.txt_total);

        JSONObject pedido = getItem(position);

        if (pedido != null) {

            try {

                String id =
                        String.valueOf(
                                pedido.getInt("id")
                        );

                String mesa =
                        String.valueOf(
                                pedido.get("mesa")
                        );

                String mesero =
                        pedido.getString("mesero");

                String detalle =
                        pedido.optString(
                                "detalle",
                                ""
                        );

                txtIdPedido.setText(
                        "Pedido #" + id
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

                /*
                 * El backend actual no devuelve
                 * estado_pedido ni total_pago.
                 */

                txtStatus.setVisibility(View.GONE);
                txtTotal.setVisibility(View.GONE);

                convertView.setOnClickListener(v -> {

                    android.content.Intent intent =
                            new android.content.Intent(
                                    getContext(),
                                    DetallePedidoActivity.class
                            );

                    intent.putExtra(
                            "id_pedido",
                            id
                    );

                    intent.putExtra(
                            "mesa",
                            mesa
                    );

                    intent.putExtra(
                            "mesero",
                            mesero
                    );

                    intent.putExtra(
                            "detalle",
                            detalle
                    );

                    getContext().startActivity(intent);
                });

            } catch (Exception e) {

                txtIdPedido.setText(
                        "Error al cargar pedido"
                );

                txtMesa.setText("");
                txtMesero.setText("");
                txtDetalle.setText("");

                txtStatus.setVisibility(View.GONE);
                txtTotal.setVisibility(View.GONE);
            }
        }

        return convertView;
    }
}