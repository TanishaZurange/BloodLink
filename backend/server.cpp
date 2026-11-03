#include <cstdlib>
#include "crow_all.h"
#include "BloodBankSystem.h"

#include <iostream>
#include <string>

using namespace std;

// CORS middleware
struct CorsMiddleware
{
    struct context {};

    void before_handle(
        crow::request& req,
        crow::response& res,
        context& ctx)
    {
    }

    void after_handle(
        crow::request& req,
        crow::response& res,
        context& ctx)
    {
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.add_header("Access-Control-Allow-Headers", "Content-Type");
    }
};

int main()
{
    crow::App<CorsMiddleware> app;
    BloodBankSystem bloodSystem;

    // ==================================
    // HEALTH CHECK
    // ==================================

    CROW_ROUTE(app, "/api/health")
    ([]()
    {
        crow::json::wvalue result;
        result["status"] = "BloodLink server is running!";
        return result;
    });

    // ==================================
    // GET ALL DONORS
    // ==================================

    CROW_ROUTE(app, "/api/donors")
    .methods(crow::HTTPMethod::GET)
    ([&bloodSystem]()
    {
        crow::json::wvalue result;
        auto donors = bloodSystem.getDonorsForWeb();

        for (size_t i = 0; i < donors.size(); i++)
        {
            result[i]["donorID"] = donors[i].getDonorID();
            result[i]["name"] = donors[i].getName();
            result[i]["phone"] = donors[i].getPhone();
            result[i]["address"] = donors[i].getAddress();
            result[i]["age"] = donors[i].getAge();
            result[i]["bloodGroup"] = donors[i].getBloodGroup();
            result[i]["available"] = donors[i].isAvailable();
        }

        return result;
    });

    // ==================================
    // REGISTER DONOR
    // ==================================

    CROW_ROUTE(app, "/api/donors")
    .methods(crow::HTTPMethod::POST)
    ([&bloodSystem](const crow::request& req)
    {
        auto data = crow::json::load(req.body);

        if (!data)
            return crow::response(400, "Invalid JSON");

        try
        {
            string name = data["name"].s();
            string phone = data["phone"].s();
            string address = data["address"].s();
            int age = static_cast<int>(data["age"].i());
            string bloodGroup = data["bloodGroup"].s();

            int donorID = 0;

            bool success = bloodSystem.registerDonorFromWeb(
                name, phone, address, age, bloodGroup, donorID
            );

            if (!success)
                return crow::response(400, "Invalid donor details");

            crow::json::wvalue result;
            result["message"] = "Donor registered successfully!";
            result["donorID"] = donorID;

            return crow::response(201, result);
        }
        catch (...)
        {
            return crow::response(400, "Invalid donor information");
        }
    });

    // ==================================
    // UPDATE DONOR AVAILABILITY
    // ==================================

    CROW_ROUTE(app, "/api/donors/availability")
    .methods(crow::HTTPMethod::POST)
    ([&bloodSystem](const crow::request& req)
    {
        auto data = crow::json::load(req.body);

        if (!data)
            return crow::response(400, "Invalid JSON");

        try
        {
            int donorID = static_cast<int>(data["donorID"].i());
            bool available = data["available"].b();

            bool success =
                bloodSystem.updateDonorAvailabilityFromWeb(
                    donorID, available
                );

            if (!success)
                return crow::response(404, "Donor not found");

            crow::json::wvalue result;
            result["message"] = "Donor availability updated!";
            return crow::response(200, result);
        }
        catch (...)
        {
            return crow::response(400, "Invalid donor information");
        }
    });

    // ==================================
    // GET ALL HOSPITALS
    // ==================================

    CROW_ROUTE(app, "/api/hospitals")
    .methods(crow::HTTPMethod::GET)
    ([&bloodSystem]()
    {
        crow::json::wvalue result;
        auto hospitals = bloodSystem.getHospitalsForWeb();

        for (size_t i = 0; i < hospitals.size(); i++)
        {
            result[i]["hospitalID"] = hospitals[i].getHospitalID();
            result[i]["name"] = hospitals[i].getHospitalName();
            result[i]["phone"] = hospitals[i].getPhone();
            result[i]["address"] = hospitals[i].getAddress();
            result[i]["location"] = hospitals[i].getLocation();
        }

        return result;
    });

    // ==================================
    // REGISTER HOSPITAL
    // ==================================

    CROW_ROUTE(app, "/api/hospitals")
    .methods(crow::HTTPMethod::POST)
    ([&bloodSystem](const crow::request& req)
    {
        auto data = crow::json::load(req.body);

        if (!data)
            return crow::response(400, "Invalid JSON");

        try
        {
            string name = data["name"].s();
            string phone = data["phone"].s();
            string address = data["address"].s();
            string location = data["location"].s();

            int hospitalID = 0;

            bool success = bloodSystem.registerHospitalFromWeb(
                name, phone, address, location, hospitalID
            );

            if (!success)
                return crow::response(400, "Invalid hospital details");

            crow::json::wvalue result;
            result["message"] = "Hospital registered successfully!";
            result["hospitalID"] = hospitalID;

            return crow::response(201, result);
        }
        catch (...)
        {
            return crow::response(400, "Invalid hospital information");
        }
    });

    // ==================================
    // GET ALL BLOOD REQUESTS
    // ==================================

    CROW_ROUTE(app, "/api/requests")
    .methods(crow::HTTPMethod::GET)
    ([&bloodSystem]()
    {
        crow::json::wvalue result;
        auto requests = bloodSystem.getRequestsForWeb();

        for (size_t i = 0; i < requests.size(); i++)
        {
            result[i]["requestID"] = requests[i].getRequestID();
            result[i]["hospitalID"] = requests[i].getHospitalID();
            result[i]["bloodGroup"] = requests[i].getBloodGroup();
            result[i]["units"] = requests[i].getUnits();
            result[i]["urgency"] = requests[i].getUrgency();
            result[i]["status"] = requests[i].getStatus();
        }

        return result;
    });

    // ==================================
    // CREATE BLOOD REQUEST
    // ==================================

    CROW_ROUTE(app, "/api/requests")
    .methods(crow::HTTPMethod::POST)
    ([&bloodSystem](const crow::request& req)
    {
        auto data = crow::json::load(req.body);

        if (!data)
            return crow::response(400, "Invalid JSON");

        try
        {
            int hospitalID =
                static_cast<int>(data["hospitalID"].i());

            int units =
                static_cast<int>(data["units"].i());

            string bloodGroup = data["bloodGroup"].s();
            string urgency = data["urgency"].s();

            int requestID = 0;

            bool success = bloodSystem.registerRequestFromWeb(
                hospitalID, bloodGroup, units, urgency, requestID
            );

            if (!success)
                return crow::response(
                    400, "Invalid hospital, blood group, units or urgency"
                );

            crow::json::wvalue result;
            result["message"] = "Blood request submitted successfully!";
            result["requestID"] = requestID;

            return crow::response(201, result);
        }
        catch (...)
        {
            return crow::response(400, "Invalid request information");
        }
    });

    // ==================================
    // UPDATE REQUEST STATUS
    // ==================================

    CROW_ROUTE(app, "/api/requests/status")
    .methods(crow::HTTPMethod::POST)
    ([&bloodSystem](const crow::request& req)
    {
        auto data = crow::json::load(req.body);

        if (!data)
            return crow::response(400, "Invalid JSON");

        try
        {
            int requestID =
                static_cast<int>(data["requestID"].i());

            string status = data["status"].s();

            bool success =
                bloodSystem.updateRequestStatusFromWeb(
                    requestID, status
                );

            if (!success)
                return crow::response(
                    400, "Request not found or invalid status"
                );

            crow::json::wvalue result;
            result["message"] = "Request status updated!";
            return crow::response(200, result);
        }
        catch (...)
        {
            return crow::response(400, "Invalid status information");
        }
    });

    cout << "BloodLink server starting..." << endl;

const char* portEnv = std::getenv("PORT");
int port = portEnv ? std::stoi(portEnv) : 18080;

app.bindaddr("0.0.0.0")
   .port(port)
   .multithreaded()
   .run();

    return 0;
}
