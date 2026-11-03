
#ifndef BLOODBANKSYSTEM_H
#define BLOODBANKSYSTEM_H

#include "Donor.h"
#include "Hospital.h"
#include "BloodRequest.h"

#include <vector>
#include <fstream>
#include <sstream>
#include <string>

using namespace std;

class BloodBankSystem {
private:
    vector<Donor> donors;
    vector<Hospital> hospitals;
    vector<BloodRequest> requests;

    int nextDonorID;
    int nextHospitalID;
    int nextRequestID;

public:
    BloodBankSystem();

    // Donor management
    void addDonor();
    void displayDonors();
    void searchDonor();
    void updateDonorAvailability();

    // Hospital management
    void addHospital();
    void displayHospitals();

    // Blood requests
    void addBloodRequest();
    void displayRequests();
    void updateRequestStatus();

    // Blood availability
    void showBloodAvailability();

    // File handling
    void saveData();
    void loadData();

    // Console menu
    void menu();

    // Website donor functions
    bool registerDonorFromWeb(
        string name,
        string phone,
        string address,
        int age,
        string bloodGroup,
        int &createdID
    );

    vector<Donor> getDonorsForWeb();

    bool updateDonorAvailabilityFromWeb(int donorID, bool status);

    // Website hospital functions
    bool registerHospitalFromWeb(
        string name,
        string phone,
        string address,
        string location,
        int &createdID
    );

    vector<Hospital> getHospitalsForWeb();

    // Website blood request functions
    bool registerRequestFromWeb(
        int hospitalID,
        string bloodGroup,
        int units,
        string urgency,
        int &createdID
    );

    vector<BloodRequest> getRequestsForWeb();

    bool updateRequestStatusFromWeb(
        int requestID,
        string newStatus
    );
};

#endif
