FROM gcc:14

WORKDIR /app

COPY . .

RUN g++ -std=c++17 -pthread \
    -I . \
    -I libraries/crow \
    -I libraries/include \
    backend/server.cpp \
    BloodBankSystem.cpp \
    Person.cpp \
    Donor.cpp \
    Hospital.cpp \
    BloodRequest.cpp \
    -o bloodlink

EXPOSE 10000

CMD ["./bloodlink"]