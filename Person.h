
#ifndef PERSON_H
#define PERSON_H

#include <iostream>
#include <string>
using namespace std;

class Person {
private:
    string name, phone, address;

public:
    Person(string n, string p, string a);

    string getName();
    string getPhone();
    string getAddress();

    virtual void displayDetails() = 0;
    virtual ~Person();
};

#endif
