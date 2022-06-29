import dash
import dash_bootstrap_components as dbc

from apps import index

app = dash.Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP, dbc.icons.BOOTSTRAP])

app.layout = index.layout

if __name__ == "__main__":
    app.run_server(debug=True)
