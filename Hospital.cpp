
#include "Hospital.h"

Hospital::Hospital(int id, string name, string phone,
                   string address, string loc)
    : Person(name, phone, address) {
    hospitalID = id;
    hospitalName = name;
    location = loc;
}

void Hospital::displayDetails() {
    cout << "\nHospital ID: " << hospitalID;
    cout << "\nHospital Name: " << hospitalName;
    cout << "\nContact: " << getPhone();
    cout << "\nAddress: " << getAddress();
    cout << "\nLocation: " << location;
    cout << "\n-------------------------\n";
}

int Hospital::getHospitalID() { return hospitalID; }
string Hospital::getHospitalName() { return hospitalName; }
string Hospital::getLocation() { return location; }
