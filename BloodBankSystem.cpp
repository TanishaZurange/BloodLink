
#include "BloodBankSystem.h"
#include <iostream>
#include <limits>

using namespace std;

// ======================================
// CONSTRUCTOR
// ======================================

BloodBankSystem::BloodBankSystem() {
    nextDonorID = 1;
    nextHospitalID = 1;
    nextRequestID = 1;
    loadData();
}

// ======================================
// REGISTER DONOR
// ======================================

void BloodBankSystem::addDonor() {
    string name, phone, address, bg;
    int age, id;

    cout << "\nEnter Name: ";
    getline(cin >> ws, name);

    cout << "Enter Phone: ";
    getline(cin, phone);

    cout << "Enter Address: ";
    getline(cin, address);

    cout << "Enter Age: ";
    cin >> age;

    cout << "Enter Blood Group: ";
    cin >> bg;

    if (!registerDonorFromWeb(name, phone, address, age, bg, id)) {
        cout << "Invalid donor details.\n";
        return;
    }

    cout << "\nDonor Registered Successfully!";
    cout << "\nDonor ID: " << id << endl;
}

// ======================================
// DISPLAY DONORS
// ======================================

void BloodBankSystem::displayDonors() {
    if (donors.empty()) {
        cout << "\nNo donors registered.\n";
        return;
    }

    for (Donor &d : donors) {
        d.displayDetails();
    }
}

// ======================================
// SEARCH DONOR
// ======================================

void BloodBankSystem::searchDonor() {
    string bg;
    bool found = false;

    cout << "\nEnter Blood Group: ";
    cin >> bg;

    for (Donor &d : donors) {
        if (d.getBloodGroup() == bg && d.isAvailable()) {
            d.displayDetails();
            found = true;
        }
    }

    if (!found)
        cout << "No available donors found.\n";
}

// ======================================
// UPDATE DONOR AVAILABILITY
// ======================================

void BloodBankSystem::updateDonorAvailability() {
    int id, choice;
    bool found = false;

    cout << "\nEnter Donor ID: ";
    cin >> id;

    for (Donor &d : donors) {
        if (d.getDonorID() == id) {
            cout << "\n1. Available";
            cout << "\n2. Not Available";
            cout << "\nEnter Choice: ";
            cin >> choice;

            if (choice == 1 || choice == 2) {
                d.updateAvailability(choice == 1);
                saveData();
                cout << "Availability updated!\n";
            }

            found = true;
            break;
        }
    }

    if (!found)
        cout << "Donor not found.\n";
}

// ======================================
// REGISTER HOSPITAL
// ======================================

void BloodBankSystem::addHospital() {
    string name, phone, address, location;

    cout << "\nEnter Hospital Name: ";
    getline(cin >> ws, name);

    cout << "Enter Phone: ";
    getline(cin, phone);

    cout << "Enter Address: ";
    getline(cin, address);

    cout << "Enter Location: ";
    getline(cin, location);

    hospitals.emplace_back(
        nextHospitalID, name, phone, address, location
    );

    cout << "\nHospital Registered!";
    cout << "\nHospital ID: " << nextHospitalID << endl;

    nextHospitalID++;
    saveData();
}

// ======================================
// DISPLAY HOSPITALS
// ======================================

void BloodBankSystem::displayHospitals() {
    if (hospitals.empty()) {
        cout << "\nNo hospitals registered.\n";
        return;
    }

    for (Hospital &h : hospitals) {
        h.displayDetails();
    }
}

// ======================================
// REGISTER BLOOD REQUEST
// ======================================

void BloodBankSystem::addBloodRequest() {
    if (hospitals.empty()) {
        cout << "\nRegister a hospital first.\n";
        return;
    }

    int hid, units;
    string bg, urgency;

    cout << "\nEnter Hospital ID: ";
    cin >> hid;

    bool found = false;

    for (Hospital &h : hospitals) {
        if (h.getHospitalID() == hid) {
            found = true;
            break;
        }
    }

    if (!found) {
        cout << "Invalid Hospital ID.\n";
        return;
    }

    cout << "Enter Required Blood Group: ";
    cin >> bg;

    cout << "Enter Units Required: ";
    cin >> units;

    if (units <= 0) {
        cout << "Invalid units.\n";
        return;
    }

    cout << "Enter Urgency (High/Medium/Low): ";
    cin >> urgency;

    if (urgency != "High" &&
        urgency != "Medium" &&
        urgency != "Low") {
        cout << "Invalid urgency.\n";
        return;
    }

    requests.emplace_back(
        nextRequestID, hid, bg, units, urgency
    );

    nextRequestID++;
    saveData();

    cout << "\nBlood request registered!\n";
}

// ======================================
// DISPLAY REQUESTS
// ======================================

void BloodBankSystem::displayRequests() {
    if (requests.empty()) {
        cout << "\nNo requests available.\n";
        return;
    }

    for (BloodRequest &r : requests) {
        r.displayRequest();
    }
}

// ======================================
// UPDATE REQUEST STATUS
// ======================================

void BloodBankSystem::updateRequestStatus() {
    int id, choice;
    string status;
    bool found = false;

    cout << "\nEnter Request ID: ";
    cin >> id;

    for (BloodRequest &r : requests) {
        if (r.getRequestID() == id) {
            cout << "\n1. Accepted";
            cout << "\n2. Completed";
            cout << "\n3. Cancelled";
            cout << "\nEnter Choice: ";
            cin >> choice;

            if (choice == 1) status = "Accepted";
            else if (choice == 2) status = "Completed";
            else if (choice == 3) status = "Cancelled";
            else {
                cout << "Invalid choice.\n";
                return;
            }

            r.updateStatus(status);
            saveData();
            found = true;
            break;
        }
    }

    if (!found)
        cout << "Request not found.\n";
}

// ======================================
// BLOOD AVAILABILITY
// ======================================

void BloodBankSystem::showBloodAvailability() {
    string groups[] = {
        "A+", "A-", "B+", "B-",
        "AB+", "AB-", "O+", "O-"
    };

    for (string bg : groups) {
        int count = 0;

        for (Donor &d : donors) {
            if (d.getBloodGroup() == bg && d.isAvailable())
                count++;
        }

        cout << bg << " : " << count << " available donors\n";
    }
}

// ======================================
// SAVE DATA
// ======================================

void BloodBankSystem::saveData() {
    ofstream df("data/donors.txt");

    for (Donor &d : donors) {
        df << d.getDonorID() << "|"
           << d.getName() << "|"
           << d.getPhone() << "|"
           << d.getAddress() << "|"
           << d.getAge() << "|"
           << d.getBloodGroup() << "|"
           << d.isAvailable() << "\n";
    }
    df.close();

    ofstream hf("data/hospitals.txt");

    for (Hospital &h : hospitals) {
        hf << h.getHospitalID() << "|"
           << h.getHospitalName() << "|"
           << h.getPhone() << "|"
           << h.getAddress() << "|"
           << h.getLocation() << "\n";
    }
    hf.close();

    ofstream rf("data/requests.txt");

    for (BloodRequest &r : requests) {
        rf << r.getRequestID() << "|"
           << r.getHospitalID() << "|"
           << r.getBloodGroup() << "|"
           << r.getUnits() << "|"
           << r.getUrgency() << "|"
           << r.getStatus() << "\n";
    }
    rf.close();
}

// ======================================
// LOAD DATA
// ======================================

void BloodBankSystem::loadData() {
    string line, value;

    ifstream df("data/donors.txt");

    while (getline(df, line)) {
        stringstream ss(line);

        int id, age;
        string name, phone, address, bg;

        getline(ss, value, '|');
        if (value.empty()) continue;
        id = stoi(value);

        getline(ss, name, '|');
        getline(ss, phone, '|');
        getline(ss, address, '|');
        getline(ss, value, '|');

        age = stoi(value);

        getline(ss, bg, '|');
        getline(ss, value, '|');

        Donor d(id, name, phone, address, age, bg);
        d.updateAvailability(value == "1");
        donors.push_back(d);

        if (id >= nextDonorID)
            nextDonorID = id + 1;
    }
    df.close();

    ifstream hf("data/hospitals.txt");

    while (getline(hf, line)) {
        stringstream ss(line);

        int id;
        string name, phone, address, location;

        getline(ss, value, '|');
        if (value.empty()) continue;
        id = stoi(value);

        getline(ss, name, '|');
        getline(ss, phone, '|');
        getline(ss, address, '|');
        getline(ss, location, '|');

        hospitals.emplace_back(id, name, phone, address, location);

        if (id >= nextHospitalID)
            nextHospitalID = id + 1;
    }
    hf.close();

    ifstream rf("data/requests.txt");

    while (getline(rf, line)) {
        stringstream ss(line);

        int id, hid, units;
        string bg, urgency, status;

        getline(ss, value, '|');
        if (value.empty()) continue;
        id = stoi(value);

        getline(ss, value, '|');
        hid = stoi(value);

        getline(ss, bg, '|');
        getline(ss, value, '|');
        units = stoi(value);

        getline(ss, urgency, '|');
        getline(ss, status, '|');

        BloodRequest r(id, hid, bg, units, urgency);
        r.updateStatus(status);
        requests.push_back(r);

        if (id >= nextRequestID)
            nextRequestID = id + 1;
    }
    rf.close();
}

// ======================================
// CONSOLE MENU
// ======================================

void BloodBankSystem::menu() {
    int choice;

    do {
        cout << "\n====================================";
        cout << "\n       BLOODLINK MANAGEMENT SYSTEM";
        cout << "\n====================================";
        cout << "\n1. Register Donor";
        cout << "\n2. Display All Donors";
        cout << "\n3. Search Donor by Blood Group";
        cout << "\n4. Update Donor Availability";
        cout << "\n5. Register Hospital";
        cout << "\n6. Display Hospitals";
        cout << "\n7. Register Emergency Blood Request";
        cout << "\n8. Display Blood Requests";
        cout << "\n9. Update Request Status";
        cout << "\n10. View Blood Group Availability";
        cout << "\n11. Exit";
        cout << "\nEnter Your Choice: ";

        if (!(cin >> choice)) {
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            cout << "Enter a valid number.\n";
            continue;
        }

        switch (choice) {
            case 1: addDonor(); break;
            case 2: displayDonors(); break;
            case 3: searchDonor(); break;
            case 4: updateDonorAvailability(); break;
            case 5: addHospital(); break;
            case 6: displayHospitals(); break;
            case 7: addBloodRequest(); break;
            case 8: displayRequests(); break;
            case 9: updateRequestStatus(); break;
            case 10: showBloodAvailability(); break;

            case 11:
                saveData();
                cout << "Thank you for using BloodLink!\n";
                break;

            default:
                cout << "Invalid choice.\n";
        }

    } while (choice != 11);
}

// ======================================
// WEBSITE: REGISTER DONOR
// ======================================

bool BloodBankSystem::registerDonorFromWeb(
    string name,
    string phone,
    string address,
    int age,
    string bloodGroup,
    int &createdID
) {
    string groups[] = {
        "A+", "A-", "B+", "B-",
        "AB+", "AB-", "O+", "O-"
    };

    bool valid = false;

    for (string group : groups) {
        if (bloodGroup == group) {
            valid = true;
            break;
        }
    }

    if (name.empty() || phone.empty() ||
        address.empty() || age < 18 ||
        age > 65 || !valid) {
        return false;
    }

    createdID = nextDonorID;

    donors.emplace_back(
        nextDonorID, name, phone, address, age, bloodGroup
    );

    nextDonorID++;
    saveData();

    return true;
}

// ======================================
// WEBSITE: GET DONORS
// ======================================

vector<Donor> BloodBankSystem::getDonorsForWeb() {
    return donors;
}

// ======================================
// WEBSITE: UPDATE DONOR AVAILABILITY
// ======================================

bool BloodBankSystem::updateDonorAvailabilityFromWeb(
    int donorID, bool status)
{
    for (Donor &d : donors) {
        if (d.getDonorID() == donorID) {
            d.updateAvailability(status);
            saveData();
            return true;
        }
    }

    return false;
}

// ======================================
// WEBSITE: REGISTER HOSPITAL
// ======================================

bool BloodBankSystem::registerHospitalFromWeb(
    string name,
    string phone,
    string address,
    string location,
    int &createdID)
{
    if (name.empty() || phone.empty() ||
        address.empty() || location.empty()) {
        return false;
    }

    createdID = nextHospitalID;

    hospitals.emplace_back(
        nextHospitalID, name, phone, address, location
    );

    nextHospitalID++;
    saveData();

    return true;
}

// ======================================
// WEBSITE: GET HOSPITALS
// ======================================

vector<Hospital> BloodBankSystem::getHospitalsForWeb() {
    return hospitals;
}

// ======================================
// WEBSITE: REGISTER BLOOD REQUEST
// ======================================

bool BloodBankSystem::registerRequestFromWeb(
    int hospitalID,
    string bloodGroup,
    int units,
    string urgency,
    int &createdID)
{
    string groups[] = {
        "A+", "A-", "B+", "B-",
        "AB+", "AB-", "O+", "O-"
    };

    bool validGroup = false;

    for (string group : groups) {
        if (bloodGroup == group) {
            validGroup = true;
            break;
        }
    }

    bool validHospital = false;

    for (Hospital &h : hospitals) {
        if (h.getHospitalID() == hospitalID) {
            validHospital = true;
            break;
        }
    }

    if (!validHospital || !validGroup || units <= 0) {
        return false;
    }

    if (urgency != "High" &&
        urgency != "Medium" &&
        urgency != "Low") {
        return false;
    }

    createdID = nextRequestID;

    requests.emplace_back(
        nextRequestID,
        hospitalID,
        bloodGroup,
        units,
        urgency
    );

    nextRequestID++;
    saveData();

    return true;
}

// ======================================
// WEBSITE: GET BLOOD REQUESTS
// ======================================

vector<BloodRequest> BloodBankSystem::getRequestsForWeb() {
    return requests;
}

// ======================================
// WEBSITE: UPDATE REQUEST STATUS
// ======================================

bool BloodBankSystem::updateRequestStatusFromWeb(
    int requestID,
    string newStatus)
{
    if (newStatus != "Pending" &&
        newStatus != "Accepted" &&
        newStatus != "Completed" &&
        newStatus != "Cancelled") {
        return false;
    }

    for (BloodRequest &r : requests) {
        if (r.getRequestID() == requestID) {
            r.updateStatus(newStatus);
            saveData();
            return true;
        }
    }

    return false;
}
