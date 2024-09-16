# PIO_Editor_Backend
[Englische version](./README_EN.md)
## Einführung

Das Backend ist eine der beiden Hauptkomponenten und kann PIO-OBs exportieren oder importieren. 
Möglich wird dies durch eine speziell entwickelte Serialisierungs- und Deserialisierungslogik, die die interne Datenstruktur 
in ein PIO-kompatibles XML-Dokument umwandelt und umgekehrt.

Log-In Routen und geöffnete Sitzungen

|      Routen       |             CRUD Typ             | Vorausgesetzte Paramter |                        Beschreibung                        |
|:-----------------:|:--------------------------------:|-------------------------|:----------------------------------------------------------:|
|    /isPIOOpen     | <p style="color:green;">GET </p> | userData: IUserData     |       <p align="left"> Überprüft ob PIO geöffnet ist       |
|  /isSessionOpen   | <p style="color:green;">GET </p> | userData: IUserData     |   <p align="left"> Überprüft ob die Sitzung geöffnet ist   |
|   /checkSession   | <p style="color:red;">POST </p>  | token: string           | <p align="left"> Überprüft ob eine Sitzung noch gültig ist |
|   /openSession    | <p style="color:red;">POST </p>  | userData: IUserData     |            <p align="left"> Neue Sitzung öffnen            |
|   /closeSession   | <p style="color:red;">POST </p>  | userData: IUserData     |        <p align="left"> Aktuelle Sitzung schließen         |
| /renewSessionTime | <p style="color:red;">POST </p>  | userData: IUserData     |           <p align="left"> Erneuere Sitzungszeit           |


PIO Routen

|     Routen     | CRUD Typ                         | Vorausgesetzte Paramter                                            |                              Beschreibung                               |
|:--------------:|----------------------------------|--------------------------------------------------------------------|:-----------------------------------------------------------------------:|
|    /openPIO    | <p style="color:red;">POST </p>  | userData: IUserData <br /> xmlString: string                       |                    <p align="left"> PIO-Datei öffnen                    |
|   /closePIO    | <p style="color:red;">POST </p>  | userData: IUserData                                                |                  <p align="left"> PIO-Datei schließen                   |
|    /newPIO     | <p style="color:red;">POST </p>  | userData: IUserData                                                |                  <p align="left"> Neues PIO erstellen                   |
|  /saveSubTree  | <p style="color:red;">POST </p>  | userData: IUserData <br />  token: string <br /> subTree: object[] |          <p align="left"> SubTree in das RootObject speichern           |
| /deleteSubTree | <p style="color:red;">POST </p>  | userData: IUserData <br />  token: string <br /> subTree: object[] |           <p align="left"> SubTree im RootObject löschen                |
|  /getSubTree   | <p style="color:green;">GET </p> | userData: IUserData <br /> paths: string[] <br /> token: string    | <p align="left"> Neues SubTree Objekt vom aktuellen RootObject erhalten |
|   /exportPIO   | <p style="color:green;">GET </p> | userData: IUserData <br />  token: string                          |        <p align="left"> Export des RootObjects in eine Xml-Datei        |
|  /getAllUuids  | <p style="color:green;">GET </p> | userData: IUserData <br />  token: string                          |             <p align="left"> Alle genutzten UUIDs erhalten              |

Other routes

|       Routes       | CRUD Type                        | Required Params                        |                                     Description                                      |
|:------------------:|----------------------------------|----------------------------------------|:------------------------------------------------------------------------------------:|
| /checkConnectionDB | <p style="color:green;">GET </p> | uri: string                            |              <p align="left"> Überprüfe die Verfügbarkeit der Datenbank              |
|    /getVersion     | <p style="color:green;">GET </p> | packageJsonVersion: string             |               <p align="left"> Aktuelle Version des Backends erhalten                |
| /getLimitationsPDF | <p style="color:green;">GET </p> | -                                      |             <p align="left"> PIOEditorLimitationenMitAnhang.pdf erhalten             |
|    /validatePIO    | <p style="color:red;">POST </p>  | token: string <br /> xmlString: string |           <p align="left"> PIO-Strkutur validieren mithilfe des Validators           |
|     /addAuthor     | <p style="color:red;">POST </p>  | token: string <br /> author: string    |              <p align="left"> Neuen Autor hinzufügen  (pio header data)              |
|   /deleteAuthor    | <p style="color:red;">POST </p>  | token: string <br /> author: string    |              <p align="left"> Autor per UUID löschen  (pio header data)              |


-----------------------------------------------------------------
## Voraussetzungen
Um das Backend schnell zu starten, muss der Benutzer alle Abhängigkeiten installieren, die in der package.json aufgeführt sind
Öffnen Sie das Terminal und installieren Sie alle Abhängigkeiten mit:
```
npm install
```

-----------------------------------------------------------------
## Quick Start

Das Backend interagiert mit dem Frontend. Dazu müssen Sie Docker starten.

Nachdem Sie Docker gestartet haben, öffnen Sie das Terminal, wechseln Sie in das Stammverzeichnis und starten Sie den Frontend-Server mit:

```
npm run start
```
Sobald der Server erfolgreich gestartet ist, hostet der Webserver lokal auf Port 7654. Alle Dienste sind jetzt
für das Frontend verfügbar.


-----------------------------------------------------------------
## Dokumentation

Der Backend-Server ermöglicht es mehreren Benutzern, PIOs gleichzeitig zu bearbeiten, sofern jeder Benutzer über sein eigenes Frontend angemeldet ist. Sobald die Nutzer ihren Vor- und Nachnamen eingegeben haben, erstellt der „Login-Service“ eine neue Sitzung.

Die Eingabe eines Passworts ist nicht notwendig, da der Editor keine interne Benutzerverwaltung anbietet. Der Benutzername wird automatisch im PIO als Autor hinterlegt.

Für jede Sitzung werden alle weiteren Benutzereingaben serverseitig für eine begrenzte Zeit gespeichert, damit bei einem Frontend-Absturz keine Daten verloren gehen.

Das Backend bietet außerdem Logik zum Importieren und Exportieren von XML-Dateien.

Eine globale serverseitige Datenbank – das Adressbuch – kann FHIR-Organisationsressourcen dauerhaft speichern, sodass Benutzer die Daten eines bekannten Pflegeheims oder Krankenhauses nicht jedes Mal neu eingeben müssen.

Das Backend ist eine der beiden Hauptkomponenten und kann PIO-OBs exportieren oder importieren. Möglich wird dies durch speziell entwickelte Serialisierungs- und Deserialisierungslogik, die die interne Datenstruktur in ein PIO-konformes XML-Dokument umwandelt und umgekehrt.

Das gesamte FHIR-Bundle wird im Backend als „EntryType“ oder als JSON-Objekt gespeichert, wobei auf Kompatibilität mit dem verwendeten XML-Parser („fast-xml-parser“) geachtet wird. Für alle Vorgänge stellt das Backend API-Routen (Application Programming Interface) für das Frontend bereit, z.B. um Daten in die Datenbank zu schreiben, bestimmte Vorgänge auf einem aktuell geöffneten PIO auszuführen oder Benutzer an- oder abzumelden.

Darüber hinaus ist das Backend möglichst generisch implementiert. Das bedeutet, dass das Backend nur Daten auf eine Baumstruktur schreibt, ohne die Struktur zu validieren.

Das Frontend muss daher wissen, unter welchem Pfad die PIO-Daten entsprechend der Spezifikation gespeichert werden. Um beispielsweise auf die Postleitzahl der hinterlegten Patientenadresse zuzugreifen, muss der folgende absolute Pfad verwendet werden:

Obwohl die LookUpTables dem Backend strukturbezogene Datentypinformationen bereitstellen, ist dies nur für die Deserialisierungslogik – also den Import – erforderlich, um die als XML-Dokument gespeicherten Daten zu analysieren und eine Zeichenfolge in die richtigen primitiven Datentypen zu überführen.

Die LookUpTables können auch verwendet werden, um zu identifizieren, ob ein XML-Pfad der PIO-OB-Spezifikation, dem PIO-Small oder keiner von beiden zugeordnet ist.