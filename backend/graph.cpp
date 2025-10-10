#include <iostream>
#include <fstream>
#include <cmath>
#include <limits>
#include "json.hpp"  // include nlohmann/json

using json = nlohmann::json;
using namespace std;

// Haversine formula
double haversine(double lat1, double lon1, double lat2, double lon2) {
    const double R = 6371.0; // km
    double dLat = (lat2 - lat1) * M_PI / 180.0;
    double dLon = (lon2 - lon1) * M_PI / 180.0;
    lat1 = lat1 * M_PI / 180.0;
    lat2 = lat2 * M_PI / 180.0;

    double a = sin(dLat/2)*sin(dLat/2) +
               cos(lat1)*cos(lat2) * sin(dLon/2)*sin(dLon/2);
    double c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return R * c;
}

// Get nearest distance between two routes
double route_distance(const vector<vector<double>>& A, const vector<vector<double>>& B) {
    double minDist = numeric_limits<double>::infinity();
    for (const auto& a : A) {
        for (const auto& b : B) {
            double d = haversine(a[0], a[1], b[0], b[1]);
            if (d < minDist) minDist = d;
        }
    }
    return minDist;
}

int main() {
    ifstream file("D1_routes.json");
    if (!file.is_open()) {
        cerr << "Failed to open D1_routes.json" << endl;
        return 1;
    }

    json data;
    file >> data;
    auto routes = data["jeepneyRoute"];
    json graph = json::array();

    for (size_t i = 0; i < routes.size(); ++i) {
        string nameA = routes[i]["name"];
        vector<vector<double>> coordsA = routes[i]["coordinates"];
        json neighbors = json::array();

        for (size_t j = 0; j < routes.size(); ++j) {
            if (i == j) continue;

            string nameB = routes[j]["name"];
            vector<vector<double>> coordsB = routes[j]["coordinates"];
            double dist = route_distance(coordsA, coordsB);

            if (dist < 2.0) { // only connect if close enough (e.g. < 2 km)
                neighbors.push_back({
                    {"route", nameB},
                    {"distance_km", dist}
                });
            }
        }

        graph.push_back({
            {"route", nameA},
            {"neighbors", neighbors}
        });

        cout << "Processed route: " << nameA << endl;
    }

    ofstream out("routes_graph.json");
    out << json{{"graph", graph}}.dump(2);
    cout << "Graph saved to routes_graph.json" << endl;

    return 0;
}
