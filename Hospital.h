
#ifndef HOSPITAL_H
#define HOSPITAL_H

#include "Person.h"

class Hospital : public Person {
private:
    int hospitalID;
    string hospitalName, location;

public:
    Hospital(int id, string name, string phone,
             string address, string loc);

    void displayDetails() override;

    int getHospitalID();
    string getHospitalName();
    string getLocation();
};

#endif
