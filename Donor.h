
#ifndef DONOR_H
#define DONOR_H

#include "Person.h"

class Donor : public Person {
private:
    int donorID, age;
    string bloodGroup;
    bool available;

public:
    Donor(int id, string n, string p, string a,
          int age, string bg);

    void displayDetails() override;
    void updateAvailability(bool status);

    int getDonorID();
    int getAge();
    string getBloodGroup();
    bool isAvailable();
};

#endif
