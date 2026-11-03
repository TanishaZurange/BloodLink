
#ifndef BLOODREQUEST_H
#define BLOODREQUEST_H

#include <iostream>
#include <string>
using namespace std;

class BloodRequest {
private:
    int requestID, hospitalID, units;
    string bloodGroup, urgency, status;

public:
    BloodRequest(int id, int hID, string bg,
                 int u, string urg);

    void displayRequest();
    void updateStatus(string newStatus);

    int getRequestID();
    int getHospitalID();
    int getUnits();

    string getBloodGroup();
    string getUrgency();
    string getStatus();
};

#endif
