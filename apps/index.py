from dash import html

import dash_bootstrap_components as dbc

layout = html.Div(
    children=[
        dbc.NavbarSimple(
            children=[
                dbc.NavItem(dbc.NavLink("Home", href="#")),
                dbc.NavItem(dbc.NavLink("About", href="#")),
                dbc.NavItem(dbc.NavLink("Features", href="#")),
                dbc.NavItem(dbc.NavLink("Cite", href="#")),
                dbc.NavItem(dbc.NavLink("Manual", href="#")),
                dbc.NavItem(dbc.NavLink("Annotator", href="#")),
                dbc.NavItem(dbc.NavLink("Model", href="#")),
                dbc.NavItem(dbc.NavLink("Contact", href="#")),
            ],
            brand="taglish-post",
            brand_href="#",
            color="dark",
            dark=True,
            style={"borderRadius": "10px"}),
        dbc.Row(
            children=[
                dbc.Col(children=[
                    html.H1("taglish part-of-speech tagger"),
                    html.P("""
                           Tool for annotating tagalog-english code-switched text.
                           Uses a hidden markov model.
                           """),
                    dbc.Carousel(
                        items=[
                            {"key": "1", "src": "assets/placeholder-600x400.png"},
                            {"key": "2", "src": "assets/placeholder-600x400.png"},
                            {"key": "3", "src": "assets/placeholder-600x400.png"},
                        ],
                        controls=True,
                        indicators=True),
                ], md=7, className="mb-3"),
                dbc.Col(children=[
                    html.H4("Navigate the App", className="mb-3"),
                    dbc.Accordion(children=[
                        dbc.AccordionItem(
                            children=[
                                html.P(
                                    html.A("What's up with this app?", href="#")),
                                html.P(
                                    html.A("What things can it do?", href="#")),
                                html.P(
                                    html.A("I want to install it locally. What should I do?",
                                           href="#")),
                            ],
                            title="Learn more"),
                        dbc.AccordionItem(
                            children=[
                                html.P("""
                                       This application runs in your browser.
                                       There is no need to install locally.
                                       """),
                                html.P("""
                                       The model with the application package
                                       is open-source. Download it thru:
                                       """),
                                html.P(html.A(
                                    children=[
                                        html.I(
                                            className="bi bi-github"),
                                        " GitHub"
                                    ],
                                    href="#",
                                    className="btn btn-outline-dark")),
                                html.P("""
                                       Part-of-speech annotation with color-visualization
                                       and summary statistics.
                                       """)
                            ],
                            title="Download"),
                    ])
                ], md=5, className="mb-3"),
            ],
            className="mt-4"),
        html.Hr(),
        html.Span("""
                  © 2022 taglish-post researchers,
                  Department of Computer Science,
                  College of Computer and Information Sciences,
                  Polytechnic University of the Philippines
                  """,
                  style={"fontSize": "0.7rem"})
    ],
    className="container py-3")
