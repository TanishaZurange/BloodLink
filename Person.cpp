
#include "Person.h"

Person::Person(string n, string p, string a) {
    name = n;
    phone = p;
    address = a;
}

string Person::getName() { return name; }
string Person::getPhone() { return phone; }
string Person::getAddress() { return address; }

Person::~Person() {}
