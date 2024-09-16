# PIO_Editor_Backend
[Deutsche version](./README.md)
## Introduction

The backend is one of the two main components and can export or import PIO OBs. This is made possible by a specially
developed serialization and deserialization logic, which converts the internal data structure into a PIO-compliant XML
document and vice versa.

Log In Route & Open sessions

|       Routes       |            CRUD Type             | Required Params      |                    Description                     |
|:------------------:|:--------------------------------:|----------------------|:--------------------------------------------------:|
|     /isPIOOpen     | <p style="color:green;">GET </p> | userData: IUserData  |       <p align="left"> Check if pio is open        |
|   /isSessionOpen   | <p style="color:green;">GET </p> | userData: IUserData  |     <p align="left"> Check if session is open      |
|   /checkSession    | <p style="color:red;">POST </p>  | token: string        | <p align="left"> Check if a session is still valid |
|    /openSession    | <p style="color:red;">POST </p>  | userData: IUserData  |       <p align="left"> Opening a new session       |
|   /closeSession    | <p style="color:red;">POST </p>  | userData: IUserData  |        <p align="left"> Closing the session        |
| /renewSessionTime  | <p style="color:red;">POST </p>  | userData: IUserData  |        <p align="left"> Renew session time         |


PIO routes

|     Routes     | CRUD Type                        | Required Params                                                     |                                Description                                 |
|:--------------:|----------------------------------|---------------------------------------------------------------------|:--------------------------------------------------------------------------:|
|    /openPIO    | <p style="color:red;">POST </p>  | userData: IUserData <br /> xmlString: string                        |                    <p align="left"> Opening a PIO file                     |
|   /closePIO    | <p style="color:red;">POST </p>  | userData: IUserData                                                 |                    <p align="left"> Closing a PIO file                     |
|    /newPIO     | <p style="color:red;">POST </p>  | userData: IUserData                                                 |                  <p align="left"> Creating a new PIO file                  |
|  /saveSubTree  | <p style="color:red;">POST </p>  | userData: IUserData <br />  token: string <br /> subTree: object[]  |            <p align="left"> Saving a SubTree to the RootObject             |
| /deleteSubTree | <p style="color:red;">POST </p>  | userData: IUserData <br />  token: string <br /> subTree: object[]  |       <p align="left"> Deleting a whole SubTree from the RootObject        |
|  /getSubTree   | <p style="color:green;">GET </p> | userData: IUserData <br /> paths: string[] <br /> token: string     |    <p align="left"> Getting new SubTree objects from current RootObject    |
|   /exportPIO   | <p style="color:green;">GET </p> | userData: IUserData <br />  token: string                           |           <p align="left"> Exporting the RootObject to xml-file            |
|  /getAllUuids  | <p style="color:green;">GET </p> | userData: IUserData <br />  token: string                           |                  <p align="left"> Getting all used uuids                   |

Other routes

|       Routes       | CRUD Type                        | Required Params                        |                                   Description                                    |
|:------------------:|----------------------------------|----------------------------------------|:--------------------------------------------------------------------------------:|
| /checkConnectionDB | <p style="color:green;">GET </p> | uri: string                            |              <p align="left"> Checking the availability of database              |
|    /getVersion     | <p style="color:green;">GET </p> | packageJsonVersion: string             |                 <p align="left"> Getting the version of backend                  |
| /getLimitationsPDF | <p style="color:green;">GET </p> | -                                      |           <p align="left"> Getting PIOEditorLimitationenMitAnhang.pdf            |
|    /validatePIO    | <p style="color:red;">POST </p>  | token: string <br /> xmlString: string | <p align="left"> Validating the PIO structure with help of the validation server |
|     /addAuthor     | <p style="color:red;">POST </p>  | token: string <br /> author: string    |             <p align="left"> Adding a new author  (pio header data)              |
|   /deleteAuthor    | <p style="color:red;">POST </p>  | token: string <br /> author: string    |          <p align="left"> Deleting an author by uuid  (pio header data)          |


-----------------------------------------------------------------
## Requirements
To quick start the backend the user must install all dependencies which are listed in the package.json
Open the terminal and install all dependencies with:
```
npm install
```

-----------------------------------------------------------------
## Quick Start

The backend interacts with the frontend. For this you have to start docker.

After you started docker open the terminal, change to root directory and start the frontend server with:

```
npm run start
```
Once the server has started successfully, the webserver will host locally on port XXXX. All services are now available
for the frontend.


-----------------------------------------------------------------
## Documentation

The backend server allows multiple users to edit PIOs at the same time, provided that each user is logged in via their
own frontend. As soon as the users have entered their first name and surname, the “login service” creates a new session.

It is not necessary to enter a password as the editor does not offer internal user management. The user name is
automatically stored in the PIO as the author.

For each session, all further user entries are saved on the server side
for a limited time so that no data is lost if the front end crashes.

The backend also provides logic for importing and exporting XML files.

A global server-side database - the address book - can permanently store FHIR organizational resources so that users do
not have to re-enter data from a known nursing home or hospital each time.

The backend is one of the two main components and can export or import PIO OBs. This is made possible by a specially
developed serialization and deserialization logic, which converts the internal data structure into a
PIO-compliant XML document and vice versa.


The entire FHIR bundle is stored in the backend as an “EntryType” or as a JSON object, whereby
attention was paid to compatibility with the XML parser used (“fast-xml-parser”).
For all operations, the backend provides API (Application Programming Interface) routes for the frontend, e.g. to write
data to the database, execute certain operations on a currently open PIO or log users in or out.

Furthermore, the backend is implemented as generically as possible. This means that the backend only writes data to a
tree structure without validating the structure.

The frontend must therefore know the path under which the PIO data is
to be saved according to the specification. For example, to access the zip code of the stored patient address, the
following absolute path would have to be used:

Although the LookUpTables provide the backend with structure-related data type information,
this is only required for the deserialization logic - i.e. importing - in order to parse the XML document data stored as
a string into the correct primitive data types.

The LookUpTables can also be used to identify whether an XML path can be
assigned to the PIO-ÜB specification, to the PIO-Small or to neither.