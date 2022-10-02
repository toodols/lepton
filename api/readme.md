# Lepton's backend/api
Originally written in typescript, now written in rust using rocket and mongodb. This is an attempt to streamline serialization + data types + bullshit.

Dates in mongodb are stored as numbers instead of bson::DateTime because it serializes as some weird object which I hate.