"use strict";
//interface -> named shape for objects
const user333 = {
    id: 1,
    name: "sangam",
    createdAt: new Date(),
    email: "xyz@gmail.com",
};
const admin333 = {
    id: 2,
    name: "sangam as admin",
    createdAt: new Date(),
    email: "xyz@gmail.com",
    permissions: ["admin"],
};
const adminWithMeta333 = {
    id: 2,
    name: "sangam as admin",
    createdAt: new Date(),
    email: "xyz@gmail.com",
    permissions: ["admin"],
    meta: {
        active: true,
    },
};
