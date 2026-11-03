
#include "BloodRequest.h"

// Constructor
BloodRequest::BloodRequest(
    int id,
    int hID,
    string bg,
    int u,
    string urg
) {
    requestID = id;
    hospitalID = hID;
    bloodGroup = bg;
    units = u;
    urgency = urg;
    status = "Pending";
}

// Display request details
void BloodRequest::displayRequest() {
    cout << "\nRequest ID: " << requestID;
    cout << "\nHospital ID: " << hospitalID;
    cout << "\nBlood Group: " << bloodGroup;
    cout << "\nUnits Required: " << units;
    cout << "\nUrgency: " << urgency;
    cout << "\nStatus: " << status;
    cout << "\n-------------------------\n";
}

// Update request status
void BloodRequest::updateStatus(string newStatus) {
    status = newStatus;
}

// Get request ID
int BloodRequest::getRequestID() {
    return requestID;
}

// Get hospital ID
int BloodRequest::getHospitalID() {
    return hospitalID;
}

// Get units
int BloodRequest::getUnits() {
    return units;
}

// Get blood group
string BloodRequest::getBloodGroup() {
    return bloodGroup;
}

// Get urgency
string BloodRequest::getUrgency() {
    return urgency;
}

// Get status
string BloodRequest::getStatus() {
    return status;
}
