
#include "Donor.h"

Donor::Donor(int id, string n, string p, string a,
             int ag, string bg)
    : Person(n, p, a) {
    donorID = id;
    age = ag;
    bloodGroup = bg;
    available = true;
}

void Donor::displayDetails() {
    cout << "\nDonor ID: " << donorID;
    cout << "\nName: " << getName();
    cout << "\nPhone: " << getPhone();
    cout << "\nAddress: " << getAddress();
    cout << "\nAge: " << age;
    cout << "\nBlood Group: " << bloodGroup;
    cout << "\nAvailability: "
         << (available ? "Available" : "Not Available");
    cout << "\n-------------------------\n";
}

void Donor::updateAvailability(bool status) {
    available = status;
}

int Donor::getDonorID() { return donorID; }
int Donor::getAge() { return age; }
string Donor::getBloodGroup() { return bloodGroup; }
bool Donor::isAvailable() { return available; }
