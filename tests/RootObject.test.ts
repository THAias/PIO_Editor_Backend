import { RootObject } from "../src/RootObject";
import {
    BooleanPIO,
    CodePIO,
    DatePIO,
    DateTimePIO,
    StringPIO,
    UriPIO,
    UuidPIO,
    SubTree,
    PrimitiveDataTypes,
} from "@thaias/pio_editor_meta";
import { getXmlFormatterOptions } from "../src/Helper";
import xmlFormat from "xml-formatter";

//Constants
const patientID = "e029b2b8-5dc6-4feb-990a-7471fb9b54e3";
const patientResourceName = "KBV_PR_MIO_ULB_Patient";
const patientPath = patientID + "." + patientResourceName;
const organizationID_1 = "39f928a1-52f6-4563-8918-214cb3b2b55f";
const organizationID_2 = "9d4b229e-40bf-4bca-8680-9657895363ea";
const organizationResourceName = "KBV_PR_MIO_ULB_Organization";
const organizationPath_1 = organizationID_1 + "." + organizationResourceName;
const organizationPath_2 = organizationID_2 + "." + organizationResourceName;
const levelOfCareID = "2a73739e-7df1-4a61-a79d-8d95ae45a563";
const levelOfCareResourceName = "KBV_PR_MIO_ULB_Observation_Care_Level";
const levelOfCarPath = levelOfCareID + "." + levelOfCareResourceName;

/* eslint-disable sonarjs/no-duplicate-string */
const getDataForTesting = (): { xmlString: string; pio: RootObject } => {
    // Generate the expected XML structure
    let expectedXML =
        '<Bundle xmlns="http://hl7.org/fhir">\n' +
        '  <id value="702d1550-d289-40df-b477-9dc23a91b243"/>\n' +
        "  <meta>\n" +
        '    <profile value="https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Bundle|1.0.0"/>\n' +
        "  </meta>\n" +
        "  <identifier>\n" +
        '    <system value="urn:ietf:rfc:3986"/>\n' +
        '    <value value="urn:uuid:9aa1e777-cc3e-419e-9395-382ab1374408"/>\n' +
        "  </identifier>\n" +
        '  <type value="document"/>\n' +
        '  <timestamp value="2023-05-13T11:48:07Z"/>\n' +
        "  <entry>\n" +
        '    <fullUrl value="urn:uuid:a1e1726e-b3ee-4584-8a7b-8ca53908f5e5"/>\n' +
        "    <resource>\n" +
        "      <Composition>\n" +
        '        <id value="a1e1726e-b3ee-4584-8a7b-8ca53908f5e5"/>\n' +
        "        <meta>\n" +
        '          <profile value="https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Composition|1.0.0"/>\n' +
        "        </meta>\n" +
        "        <text>\n" +
        '          <status value="extensions"/>\n' +
        '          <div xmlns="http://www.w3.org/1999/xhtml">\n' +
        "            <h1>Composition</h1>\n" +
        "          </div>\n" +
        "        </text>\n" +
        '        <extension url="https://fhir.kbv.de/StructureDefinition/KBV_EX_MIO_ULB_Reference_Receiving_Institution">\n' +
        "          <valueReference>\n" +
        '            <reference value="urn:uuid:9d4b229e-40bf-4bca-8680-9657895363ea"/>\n' +
        "          </valueReference>\n" +
        "        </extension>\n" +
        '        <status value="final"/>\n' +
        "        <type>\n" +
        "          <coding>\n" +
        '            <system value="http://snomed.info/sct"/>\n' +
        '            <version value="http://snomed.info/sct/900000000000207008/version/20220331"/>\n' +
        '            <code value="721919000"/>\n' +
        '            <display value="Nurse discharge summary (record artifact)"/>\n' +
        "          </coding>\n" +
        "        </type>\n" +
        "        <subject>\n" +
        '          <reference value="urn:uuid:e029b2b8-5dc6-4feb-990a-7471fb9b54e3"/>\n' +
        "        </subject>\n" +
        '        <date value="2023-05-13T11:48:07Z"/>\n' +
        "        <author>\n" +
        '          <reference value="urn:uuid:b4d930e3-796c-43b7-829d-3daa951e879c"/>\n' +
        "        </author>\n" +
        "        <author>\n" +
        '          <reference value="urn:uuid:2369c2fb-1b7b-45be-b001-8268e417ec5c"/>\n' +
        "        </author>\n" +
        '        <title value="Überleitungsbogen"/>\n' +
        "        <section>\n" +
        '          <title value="Pflegegrad"/>\n' +
        "          <code>\n" +
        "            <coding>\n" +
        '              <system value="https://fhir.kbv.de/CodeSystem/KBV_CS_MIO_ULB_Section_Codes"/>\n' +
        '              <version value="1.0.0"/>\n' +
        '              <code value="SectionPflegegrad"/>\n' +
        '              <display value="Bereich Pflegegrad"/>\n' +
        "            </coding>\n" +
        "          </code>\n" +
        "          <entry>\n" +
        '            <reference value="urn:uuid:2a73739e-7df1-4a61-a79d-8d95ae45a563"/>\n' +
        "          </entry>\n" +
        "        </section>\n" +
        "        <section>\n" +
        '          <title value="Grad der Behinderung"/>\n' +
        "          <code>\n" +
        "            <coding>\n" +
        '              <system value="http://snomed.info/sct"/>\n' +
        '              <version value="http://snomed.info/sct/900000000000207008/version/20220331"/>\n' +
        '              <code value="363787002:704326004=21134002"/>\n' +
        '              <display value="Observable entity (observable entity) : Precondition (attribute) = Disability (finding)"/>\n' +
        "            </coding>\n" +
        "          </code>\n" +
        "          <entry>\n" +
        '            <reference value="urn:uuid:acfe132b-ee66-4917-8694-cd60015480df"/>\n' +
        "          </entry>\n" +
        "        </section>\n" +
        "        <section>\n" +
        '          <title value="Persönliche Erklärungen / Gesetzliche Betreuung"/>\n' +
        "          <code>\n" +
        "            <coding>\n" +
        '              <system value="http://snomed.info/sct"/>\n' +
        '              <version value="http://snomed.info/sct/900000000000207008/version/20220331"/>\n' +
        '              <code value="224329005"/>\n' +
        '              <display value="Legal affairs and legal constraints (observable entity)"/>\n' +
        "            </coding>\n" +
        "          </code>\n" +
        "          <entry>\n" +
        '            <reference value="urn:uuid:601c01aa-b331-452e-a5f7-ccda91ce2d20"/>\n' +
        "          </entry>\n" +
        "        </section>\n" +
        "        <section>\n" +
        '          <title value="Probleme"/>\n' +
        "          <code>\n" +
        "            <coding>\n" +
        '              <system value="http://snomed.info/sct"/>\n' +
        '              <version value="http://snomed.info/sct/900000000000207008/version/20220331"/>\n' +
        '              <code value="1184595009"/>\n' +
        '              <display value="Present problem document section (record artifact)"/>\n' +
        "            </coding>\n" +
        "          </code>\n" +
        "          <entry>\n" +
        '            <reference value="urn:uuid:1d6d42a3-9f2f-4d30-8b1e-a62c0d066938"/>\n' +
        "          </entry>\n" +
        "        </section>\n" +
        "        <section>\n" +
        '          <title value="Risiken"/>\n' +
        "          <code>\n" +
        "            <coding>\n" +
        '              <system value="http://loinc.org"/>\n' +
        '              <version value="2.72"/>\n' +
        '              <code value="75456-4"/>\n' +
        '              <display value="Nurse Risk assessment and screening note"/>\n' +
        "            </coding>\n" +
        "          </code>\n" +
        "          <entry>\n" +
        '            <reference value="urn:uuid:cfd1bb31-c9fc-46cd-ab12-e20425fa22f4"/>\n' +
        "          </entry>\n" +
        "        </section>\n" +
        "        <section>\n" +
        '          <title value="Ernährung"/>\n' +
        "          <code>\n" +
        "            <coding>\n" +
        '              <system value="http://loinc.org"/>\n' +
        '              <version value="2.72"/>\n' +
        '              <code value="34801-1"/>\n' +
        '              <display value="Nutrition and dietetics Note"/>\n' +
        "            </coding>\n" +
        "          </code>\n" +
        "          <entry>\n" +
        '            <reference value="urn:uuid:0d8bd5cd-cd71-4f48-a514-b28e648c541b"/>\n' +
        "          </entry>\n" +
        "        </section>\n" +
        "        <section>\n" +
        '          <title value="Funktionsbeurteilungen"/>\n' +
        "          <code>\n" +
        "            <coding>\n" +
        '              <system value="http://snomed.info/sct"/>\n' +
        '              <version value="http://snomed.info/sct/900000000000207008/version/20220331"/>\n' +
        '              <code value="1184588000"/>\n' +
        '              <display value="Functional status document section (record artifact)"/>\n' +
        "            </coding>\n" +
        "          </code>\n" +
        "          <entry>\n" +
        '            <reference value="urn:uuid:2029b394-4ccd-4acc-9141-cdf5a3bdd63a"/>\n' +
        "          </entry>\n" +
        "        </section>\n" +
        "        <section>\n" +
        '          <title value="Allergien und Unverträglichkeiten"/>\n' +
        "          <code>\n" +
        "            <coding>\n" +
        '              <system value="http://snomed.info/sct"/>\n' +
        '              <version value="http://snomed.info/sct/900000000000207008/version/20220331"/>\n' +
        '              <code value="722446000"/>\n' +
        '              <display value="Allergy record (record artifact)"/>\n' +
        "            </coding>\n" +
        "          </code>\n" +
        "          <entry>\n" +
        '            <reference value="urn:uuid:035596d1-2d72-450d-b4cc-7fead566c979"/>\n' +
        "          </entry>\n" +
        "        </section>\n" +
        "      </Composition>\n" +
        "    </resource>\n" +
        "  </entry>\n" +
        "  <entry>\n" +
        '    <fullUrl value="urn:uuid:e029b2b8-5dc6-4feb-990a-7471fb9b54e3"/>\n' +
        "    <resource>\n" +
        "      <Patient>\n" +
        '        <id value="e029b2b8-5dc6-4feb-990a-7471fb9b54e3"/>\n' +
        "        <meta>\n" +
        '          <profile value="https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Patient|1.0.0"/>\n' +
        "        </meta>\n" +
        "        <text>\n" +
        '          <status value="extensions"/>\n' +
        '          <div xmlns="http://www.w3.org/1999/xhtml">\n' +
        "            <h1>Kleiner Patient</h1>\n" +
        "          </div>\n" +
        "        </text>\n" +
        '        <extension url="https://fhir.kbv.de/StructureDefinition/KBV_EX_MIO_ULB_Religion">\n' +
        '          <valueString value="Römisch Katholisch"/>\n' +
        "        </extension>\n" +
        '        <extension url="https://fhir.kbv.de/StructureDefinition/KBV_EX_MIO_ULB_Interpreter_Required">\n' +
        '          <valueBoolean value="true"/>\n' +
        "        </extension>\n" +
        '        <extension url="https://fhir.kbv.de/StructureDefinition/KBV_EX_MIO_ULB_Notes_For_Communication">\n' +
        '          <valueString value="Bitte nur leise mit dem Patienten reden."/>\n' +
        "        </extension>\n" +
        "        <name>\n" +
        '          <use value="official"/>\n' +
        '          <text value="Dr. Peter Prinz von Stackelberg"/>\n' +
        '          <family value="Prinz von Stackelberg">\n' +
        '            <extension url="http://fhir.de/StructureDefinition/humanname-namenszusatz">\n' +
        '              <valueString value="Prinz"/>\n' +
        "            </extension>\n" +
        '            <extension url="http://hl7.org/fhir/StructureDefinition/humanname-own-name">\n' +
        '              <valueString value="Stackelberg"/>\n' +
        "            </extension>\n" +
        '            <extension url="http://hl7.org/fhir/StructureDefinition/humanname-own-prefix">\n' +
        '              <valueString value="von"/>\n' +
        "            </extension>\n" +
        "          </family>\n" +
        '          <given value="Peter"/>\n' +
        '          <prefix value="Dr.">\n' +
        '            <extension url="http://hl7.org/fhir/StructureDefinition/iso21090-EN-qualifier">\n' +
        '              <valueCode value="AC"/>\n' +
        "            </extension>\n" +
        "          </prefix>\n" +
        "        </name>\n" +
        "        <name>\n" +
        '          <use value="maiden"/>\n' +
        '          <text value="Graf Meyer"/>\n' +
        '          <family value="Graf Meyer">\n' +
        '            <extension url="http://fhir.de/StructureDefinition/humanname-namenszusatz">\n' +
        '              <valueString value="Graf"/>\n' +
        "            </extension>\n" +
        '            <extension url="http://hl7.org/fhir/StructureDefinition/humanname-own-name">\n' +
        '              <valueString value="Meyer"/>\n' +
        "            </extension>\n" +
        "          </family>\n" +
        "        </name>\n" +
        "        <telecom>\n" +
        '          <system value="phone"/>\n' +
        '          <value value="023578239"/>\n' +
        "        </telecom>\n" +
        "        <telecom>\n" +
        '          <system value="email"/>\n' +
        '          <value value="lol@gmx.de"/>\n' +
        "        </telecom>\n" +
        '        <gender value="male">\n' +
        '          <extension url="http://fhir.de/StructureDefinition/gender-amtlich-de">\n' +
        "            <valueCoding>\n" +
        '              <system value="http://fhir.de/CodeSystem/gender-amtlich-de"/>\n' +
        '              <version value="1.3.2"/>\n' +
        '              <code value="D"/>\n' +
        '              <display value="divers"/>\n' +
        "            </valueCoding>\n" +
        "          </extension>\n" +
        "        </gender>\n" +
        '        <birthDate value="1945-04-20"/>\n' +
        "        <address>\n" +
        '          <extension url="http://hl7.org/fhir/StructureDefinition/iso21090-ADXP-precinct">\n' +
        '            <valueString value="Lechhausen"/>\n' +
        "          </extension>\n" +
        '          <use value="home"/>\n' +
        '          <type value="both"/>\n' +
        '          <text value="Tulpenstrasse 3c, Lechhausen, 86150 Augsburg, DE"/>\n' +
        '          <line value="Tulpenstrasse 3c">\n' +
        '            <extension url="http://hl7.org/fhir/StructureDefinition/iso21090-ADXP-streetName">\n' +
        '              <valueString value="Tulpenstrasse"/>\n' +
        "            </extension>\n" +
        '            <extension url="http://hl7.org/fhir/StructureDefinition/iso21090-ADXP-houseNumber">\n' +
        '              <valueString value="3"/>\n' +
        "            </extension>\n" +
        '            <extension url="http://hl7.org/fhir/StructureDefinition/iso21090-ADXP-additionalLocator">\n' +
        '              <valueString value="c"/>\n' +
        "            </extension>\n" +
        "          </line>\n" +
        '          <city value="Augsburg"/>\n' +
        '          <postalCode value="86150"/>\n' +
        '          <country value="DE"/>\n' +
        "        </address>\n" +
        "        <communication>\n" +
        "          <language>\n" +
        "            <coding>\n" +
        '              <system value="urn:ietf:bcp:47"/>\n' +
        '              <version value="4.0.1"/>\n' +
        '              <code value="de"/>\n' +
        '              <display value="German"/>\n' +
        "            </coding>\n" +
        "          </language>\n" +
        "        </communication>\n" +
        "      </Patient>\n" +
        "    </resource>\n" +
        "  </entry>\n" +
        "  <entry>\n" +
        '    <fullUrl value="urn:uuid:39f928a1-52f6-4563-8918-214cb3b2b55f"/>\n' +
        "    <resource>\n" +
        "      <Organization>\n" +
        '        <id value="39f928a1-52f6-4563-8918-214cb3b2b55f"/>\n' +
        "        <meta>\n" +
        '          <profile value="https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Organization"/>\n' +
        "        </meta>\n" +
        "        <text>\n" +
        '          <status value="extensions"/>\n' +
        '          <div xmlns="http://www.w3.org/1999/xhtml">\n' +
        "            <h1>\n" +
        "              <b>Sendende Einrichtung</b>\n" +
        "            </h1>\n" +
        "          </div>\n" +
        "        </text>\n" +
        '        <name value="Klinikum Augsburg"/>\n' +
        "        <telecom>\n" +
        '          <system value="phone"/>\n' +
        '          <value value="0821-2357346"/>\n' +
        "        </telecom>\n" +
        "      </Organization>\n" +
        "    </resource>\n" +
        "  </entry>\n" +
        "  <entry>\n" +
        '    <fullUrl value="urn:uuid:9d4b229e-40bf-4bca-8680-9657895363ea"/>\n' +
        "    <resource>\n" +
        "      <Organization>\n" +
        '        <id value="9d4b229e-40bf-4bca-8680-9657895363ea"/>\n' +
        "        <meta>\n" +
        '          <profile value="https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Organization"/>\n' +
        "        </meta>\n" +
        "        <text>\n" +
        '          <status value="extensions"/>\n' +
        '          <div xmlns="http://www.w3.org/1999/xhtml">\n' +
        "            <h1>Empfangende Einrichtung</h1>\n" +
        "          </div>\n" +
        "        </text>\n" +
        '        <name value="AWONIA Pflegeheim"/>\n' +
        "        <telecom>\n" +
        '          <system value="phone"/>\n' +
        '          <value value="0821-6242345"/>\n' +
        "        </telecom>\n" +
        "      </Organization>\n" +
        "    </resource>\n" +
        "  </entry>\n" +
        "  <entry>\n" +
        '    <fullUrl value="urn:uuid:2a73739e-7df1-4a61-a79d-8d95ae45a563"/>\n' +
        "    <resource>\n" +
        "      <Observation>\n" +
        '        <id value="2a73739e-7df1-4a61-a79d-8d95ae45a563"/>\n' +
        "        <meta>\n" +
        '          <profile value="https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Observation_Care_Level|1.0.0"/>\n' +
        "        </meta>\n" +
        "        <text>\n" +
        '          <status value="extensions"/>\n' +
        '          <div xmlns="http://www.w3.org/1999/xhtml">\n' +
        "            <h1>Observation</h1>\n" +
        "          </div>\n" +
        "        </text>\n" +
        '        <extension url="https://fhir.kbv.de/StructureDefinition/KBV_EX_MIO_ULB_Application_Status">\n' +
        '          <extension url="beantragungsdatum">\n' +
        '            <valueDateTime value="2023-04-02T00:00:00Z"/>\n' +
        "          </extension>\n" +
        '          <extension url="antragsstatusPflegegrad">\n' +
        "            <valueCodeableConcept>\n" +
        "              <coding>\n" +
        '                <system value="https://fhir.kbv.de/CodeSystem/KBV_CS_MIO_ULB_Application_Status_Care_Level"/>\n' +
        '                <version value="1.0.0"/>\n' +
        '                <code value="Beantragung_mit_Pflegegradzuweisung_abgeschlossen"/>\n' +
        '                <display value="Beantragung mit Pflegegradzuweisung abgeschlossen"/>\n' +
        "              </coding>\n" +
        "            </valueCodeableConcept>\n" +
        "          </extension>\n" +
        "        </extension>\n" +
        '        <status value="final"/>\n' +
        "        <code>\n" +
        "          <coding>\n" +
        '            <system value="http://loinc.org"/>\n' +
        '            <version value="2.72"/>\n' +
        '            <code value="80391-6"/>\n' +
        '            <display value="Level of care [Type]"/>\n' +
        "          </coding>\n" +
        "        </code>\n" +
        "        <subject>\n" +
        '          <reference value="urn:uuid:e029b2b8-5dc6-4feb-990a-7471fb9b54e3"/>\n' +
        "        </subject>\n" +
        "        <valueCodeableConcept>\n" +
        "          <coding>\n" +
        '            <system value="http://fhir.de/CodeSystem/bfarm/ops"/>\n' +
        '            <version value="1.0.0"/>\n' +
        '            <code value="9-984.9"/>\n' +
        '            <display value="Pflegebedürftig nach Pflegegrad 4"/>\n' +
        "          </coding>\n" +
        "        </valueCodeableConcept>\n" +
        "      </Observation>\n" +
        "    </resource>\n" +
        "  </entry>\n" +
        "  <entry>\n" +
        '    <fullUrl value="urn:uuid:acfe132b-ee66-4917-8694-cd60015480df"/>\n' +
        "    <resource>\n" +
        "      <Observation>\n" +
        '        <id value="acfe132b-ee66-4917-8694-cd60015480df"/>\n' +
        "        <meta>\n" +
        '          <profile value="https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Observation_Degree_Of_Disability_Available|1.0.0"/>\n' +
        "        </meta>\n" +
        "        <text>\n" +
        '          <status value="extensions"/>\n' +
        '          <div xmlns="http://www.w3.org/1999/xhtml">\n' +
        "            <h1>Observation</h1>\n" +
        "          </div>\n" +
        "        </text>\n" +
        '        <status value="final"/>\n' +
        "        <code>\n" +
        "          <coding>\n" +
        '            <system value="http://snomed.info/sct"/>\n' +
        '            <version value="http://snomed.info/sct/900000000000207008/version/20220331"/>\n' +
        '            <code value="363787002:704326004=(404684003:363713009=260411009,47429007=(21134002:363713009=272520006))"/>\n' +
        '            <display value="Observable entity (observable entity) : Precondition (attribute) = ( Clinical finding (finding) : Has interpretation (attribute) = Presence findings (qualifier value) , Associated with (attribute) = ( Disability (finding) : Has interpretation (attribute) = Degree findings (qualifier value) ) )"/>\n' +
        "          </coding>\n" +
        "        </code>\n" +
        "        <subject>\n" +
        '          <reference value="urn:uuid:e029b2b8-5dc6-4feb-990a-7471fb9b54e3"/>\n' +
        "        </subject>\n" +
        "        <valueCodeableConcept>\n" +
        "          <coding>\n" +
        '            <system value="https://fhir.kbv.de/ValueSet/KBV_VS_MIO_ULB_Disability_Degree_Presence_Status"/>\n' +
        '            <version value="1.0.0"/>\n' +
        '            <code value="404684003:363713009=2667000,47429007=(21134002:363713009=272520006)"/>\n' +
        '            <display value="Clinical finding (finding) : Has interpretation (attribute) = Absent (qualifier value) , Associated with (attribute) = ( Disability (finding) : Has interpretation (attribute) = Degree findings (qualifier value) )"/>\n' +
        "          </coding>\n" +
        "        </valueCodeableConcept>\n" +
        "      </Observation>\n" +
        "    </resource>\n" +
        "  </entry>\n" +
        "  <entry>\n" +
        '    <fullUrl value="urn:uuid:035596d1-2d72-450d-b4cc-7fead566c979"/>\n' +
        "    <resource>\n" +
        "      <Observation>\n" +
        '        <id value="035596d1-2d72-450d-b4cc-7fead566c979"/>\n' +
        "        <meta>\n" +
        '          <profile value="https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Observation_Presence_Allergies|1.0.0"/>\n' +
        "        </meta>\n" +
        "        <text>\n" +
        '          <status value="extensions"/>\n' +
        '          <div xmlns="http://www.w3.org/1999/xhtml">\n' +
        "            <h1>Observation</h1>\n" +
        "          </div>\n" +
        "        </text>\n" +
        '        <status value="final"/>\n' +
        "        <code>\n" +
        "          <coding>\n" +
        '            <system value="http://snomed.info/sct"/>\n' +
        '            <version value="http://snomed.info/sct/900000000000207008/version/20220331"/>\n' +
        '            <code value="363787002:704326004=420134006"/>\n' +
        '            <display value="Observable entity (observable entity) : Precondition (attribute) = Propensity to adverse reaction (finding)"/>\n' +
        "          </coding>\n" +
        "        </code>\n" +
        "        <subject>\n" +
        '          <reference value="urn:uuid:e029b2b8-5dc6-4feb-990a-7471fb9b54e3"/>\n' +
        "        </subject>\n" +
        "        <valueCodeableConcept>\n" +
        "          <coding>\n" +
        '            <system value="https://fhir.kbv.de/ValueSet/KBV_VS_MIO_ULB_Allergies"/>\n' +
        '            <version value="1.0.0"/>\n' +
        '            <code value="420134006:363713009=2667000"/>\n' +
        '            <display value="Propensity to adverse reaction (finding) : Has interpretation (attribute) = Absent (qualifier value)"/>\n' +
        "          </coding>\n" +
        "        </valueCodeableConcept>\n" +
        "      </Observation>\n" +
        "    </resource>\n" +
        "  </entry>\n" +
        "  <entry>\n" +
        '    <fullUrl value="urn:uuid:2029b394-4ccd-4acc-9141-cdf5a3bdd63a"/>\n' +
        "    <resource>\n" +
        "      <Observation>\n" +
        '        <id value="2029b394-4ccd-4acc-9141-cdf5a3bdd63a"/>\n' +
        "        <meta>\n" +
        '          <profile value="https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Observation_Presence_Functional_Assessment|1.0.0"/>\n' +
        "        </meta>\n" +
        "        <text>\n" +
        '          <status value="extensions"/>\n' +
        '          <div xmlns="http://www.w3.org/1999/xhtml">\n' +
        "            <h1>Observation</h1>\n" +
        "          </div>\n" +
        "        </text>\n" +
        '        <status value="final"/>\n' +
        "        <code>\n" +
        "          <coding>\n" +
        '            <system value="http://snomed.info/sct"/>\n' +
        '            <version value="http://snomed.info/sct/900000000000207008/version/20220331"/>\n' +
        '            <code value="363787002:704326004=105719004"/>\n' +
        '            <display value="Observable entity (observable entity) : Precondition (attribute) = Body disability AND/OR failure state (finding)"/>\n' +
        "          </coding>\n" +
        "        </code>\n" +
        "        <subject>\n" +
        '          <reference value="urn:uuid:e029b2b8-5dc6-4feb-990a-7471fb9b54e3"/>\n' +
        "        </subject>\n" +
        "        <valueCodeableConcept>\n" +
        "          <coding>\n" +
        '            <system value="https://fhir.kbv.de/ValueSet/KBV_VS_MIO_ULB_Allergies"/>\n' +
        '            <version value="1.0.0"/>\n' +
        '            <code value="373572006:246090004=105719004"/>\n' +
        '            <display value="Clinical finding absent (situation) : Associated finding (attribute) = Body disability AND/OR failure state (finding)"/>\n' +
        "          </coding>\n" +
        "        </valueCodeableConcept>\n" +
        "      </Observation>\n" +
        "    </resource>\n" +
        "  </entry>\n" +
        "  <entry>\n" +
        '    <fullUrl value="urn:uuid:1d6d42a3-9f2f-4d30-8b1e-a62c0d066938"/>\n' +
        "    <resource>\n" +
        "      <Observation>\n" +
        '        <id value="1d6d42a3-9f2f-4d30-8b1e-a62c0d066938"/>\n' +
        "        <meta>\n" +
        '          <profile value="https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Observation_Presence_Problems|1.0.0"/>\n' +
        "        </meta>\n" +
        "        <text>\n" +
        '          <status value="extensions"/>\n' +
        '          <div xmlns="http://www.w3.org/1999/xhtml">\n' +
        "            <h1>Observation</h1>\n" +
        "          </div>\n" +
        "        </text>\n" +
        '        <status value="final"/>\n' +
        "        <code>\n" +
        "          <coding>\n" +
        '            <system value="http://snomed.info/sct"/>\n' +
        '            <version value="http://snomed.info/sct/900000000000207008/version/20220331"/>\n' +
        '            <code value="363787002:704326004=(404684003:47429007=55607006)"/>\n' +
        '            <display value="Observable entity (observable entity) : Precondition (attribute) = ( Clinical finding (finding) : Associated with (attribute) = Problem (finding) )"/>\n' +
        "          </coding>\n" +
        "        </code>\n" +
        "        <subject>\n" +
        '          <reference value="urn:uuid:e029b2b8-5dc6-4feb-990a-7471fb9b54e3"/>\n' +
        "        </subject>\n" +
        "        <valueCodeableConcept>\n" +
        "          <coding>\n" +
        '            <system value="https://fhir.kbv.de/ValueSet/KBV_VS_MIO_ULB_Problem_Presence"/>\n' +
        '            <version value="1.0.0"/>\n' +
        '            <code value="373572006:246090004=55607006"/>\n' +
        '            <display value="Clinical finding absent (situation) : Associated finding (attribute) = Problem (finding)"/>\n' +
        "          </coding>\n" +
        "        </valueCodeableConcept>\n" +
        "      </Observation>\n" +
        "    </resource>\n" +
        "  </entry>\n" +
        "  <entry>\n" +
        '    <fullUrl value="urn:uuid:cfd1bb31-c9fc-46cd-ab12-e20425fa22f4"/>\n' +
        "    <resource>\n" +
        "      <Observation>\n" +
        '        <id value="cfd1bb31-c9fc-46cd-ab12-e20425fa22f4"/>\n' +
        "        <meta>\n" +
        '          <profile value="https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Observation_Presence_Risks|1.0.0"/>\n' +
        "        </meta>\n" +
        "        <text>\n" +
        '          <status value="extensions"/>\n' +
        '          <div xmlns="http://www.w3.org/1999/xhtml">\n' +
        "            <h1>Observation</h1>\n" +
        "          </div>\n" +
        "        </text>\n" +
        '        <status value="final"/>\n' +
        "        <code>\n" +
        "          <coding>\n" +
        '            <system value="http://snomed.info/sct"/>\n' +
        '            <version value="http://snomed.info/sct/900000000000207008/version/20220331"/>\n' +
        '            <code value="102485007"/>\n' +
        '            <display value="Personal risk factor (observable entity)"/>\n' +
        "          </coding>\n" +
        "        </code>\n" +
        "        <subject>\n" +
        '          <reference value="urn:uuid:e029b2b8-5dc6-4feb-990a-7471fb9b54e3"/>\n' +
        "        </subject>\n" +
        "        <valueCodeableConcept>\n" +
        "          <coding>\n" +
        '            <system value="https://fhir.kbv.de/ValueSet/KBV_VS_MIO_ULB_Risk_Presence"/>\n' +
        '            <version value="1.0.0"/>\n' +
        '            <code value="373572006:246090004=281694009"/>\n' +
        '            <display value="Clinical finding absent (situation) : Associated finding (attribute) = Finding of at risk (finding)"/>\n' +
        "          </coding>\n" +
        "        </valueCodeableConcept>\n" +
        "      </Observation>\n" +
        "    </resource>\n" +
        "  </entry>\n" +
        "  <entry>\n" +
        '    <fullUrl value="urn:uuid:0d8bd5cd-cd71-4f48-a514-b28e648c541b"/>\n' +
        "    <resource>\n" +
        "      <Observation>\n" +
        '        <id value="0d8bd5cd-cd71-4f48-a514-b28e648c541b"/>\n' +
        "        <meta>\n" +
        '          <profile value="https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Observation_Presence_Information_Nutrition|1.0.0"/>\n' +
        "        </meta>\n" +
        "        <text>\n" +
        '          <status value="extensions"/>\n' +
        '          <div xmlns="http://www.w3.org/1999/xhtml">\n' +
        "            <h1>Observation</h1>\n" +
        "          </div>\n" +
        "        </text>\n" +
        '        <status value="final"/>\n' +
        "        <code>\n" +
        "          <coding>\n" +
        '            <system value="http://snomed.info/sct"/>\n' +
        '            <version value="http://snomed.info/sct/900000000000207008/version/20220331"/>\n' +
        '            <code value="364393001:704321009=384760004"/>\n' +
        '            <display value="Nutritional observable (observable entity) : Characterizes (attribute) = Feeding and dietary regime (regime/therapy)"/>\n' +
        "          </coding>\n" +
        "        </code>\n" +
        "        <subject>\n" +
        '          <reference value="urn:uuid:e029b2b8-5dc6-4feb-990a-7471fb9b54e3"/>\n' +
        "        </subject>\n" +
        "        <valueCodeableConcept>\n" +
        "          <coding>\n" +
        '            <system value="https://fhir.kbv.de/ValueSet/KBV_VS_MIO_ULB_Nutritional_Information"/>\n' +
        '            <version value="1.0.0"/>\n' +
        '            <code value="373572006:246090004=300893006"/>\n' +
        '            <display value="Clinical finding absent (situation) : Associated finding (attribute) = Nutritional finding (finding)"/>\n' +
        "          </coding>\n" +
        "        </valueCodeableConcept>\n" +
        "      </Observation>\n" +
        "    </resource>\n" +
        "  </entry>\n" +
        "  <entry>\n" +
        '    <fullUrl value="urn:uuid:601c01aa-b331-452e-a5f7-ccda91ce2d20"/>\n' +
        "    <resource>\n" +
        "      <Observation>\n" +
        '        <id value="601c01aa-b331-452e-a5f7-ccda91ce2d20"/>\n' +
        "        <meta>\n" +
        '          <profile value="https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Observation_Personal_Statements|1.0.0"/>\n' +
        "        </meta>\n" +
        "        <text>\n" +
        '          <status value="extensions"/>\n' +
        '          <div xmlns="http://www.w3.org/1999/xhtml">\n' +
        "            <h1>Observation</h1>\n" +
        "          </div>\n" +
        "        </text>\n" +
        '        <status value="final"/>\n' +
        "        <code>\n" +
        "          <coding>\n" +
        '            <system value="http://snomed.info/sct"/>\n' +
        '            <version value="http://snomed.info/sct/900000000000207008/version/20220331"/>\n' +
        '            <code value="363787002:704325000=371538006"/>\n' +
        '            <display value="Observable entity (observable entity): Relative to (attribute) = Advance directive report (record artifact)"/>\n' +
        "          </coding>\n" +
        "        </code>\n" +
        "        <subject>\n" +
        '          <reference value="urn:uuid:e029b2b8-5dc6-4feb-990a-7471fb9b54e3"/>\n' +
        "        </subject>\n" +
        "        <valueCodeableConcept>\n" +
        "          <coding>\n" +
        '            <system value="https://fhir.kbv.de/ValueSet/KBV_VS_MIO_ULB_Advance_Directive_Status"/>\n' +
        '            <version value="1.0.0"/>\n' +
        '            <code value="310301000:363713009=2667000"/>\n' +
        '            <display value="Advance healthcare directive status (finding) : Has interpretation (attribute) = Absent (qualifier value)"/>\n' +
        "          </coding>\n" +
        "        </valueCodeableConcept>\n" +
        "      </Observation>\n" +
        "    </resource>\n" +
        "  </entry>\n" +
        "</Bundle>";

    expectedXML = xmlFormat(expectedXML, getXmlFormatterOptions());

    //Generate a RootObject with similar values like 'expectedXML'
    const pio: RootObject = new RootObject({ firstName: "test", lastName: "test" });

    const telecomSystemPath = ".telecom[0].system";
    const telecomValuePath = ".telecom[0].value";
    const profileHeaderPath = ".@profile@";

    pio.content
        //Patient resource
        .setValue(
            patientPath + profileHeaderPath,
            new StringPIO("https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Patient|1.0.0")
        )
        .setValue(patientPath + ".@status@", new StringPIO("extensions"))
        .setValue(patientPath + ".@div@", new StringPIO("<h1>Kleiner Patient</h1>")) // Add narrative
        .setValue(
            patientPath + ".extension[0]",
            new UriPIO("https://fhir.kbv.de/StructureDefinition/KBV_EX_MIO_ULB_Religion")
        )
        .setValue(patientPath + ".extension[0].valueString", new StringPIO("Römisch Katholisch"))
        .setValue(
            patientPath + ".extension[1]",
            new UriPIO("https://fhir.kbv.de/StructureDefinition/KBV_EX_MIO_ULB_Interpreter_Required")
        )
        .setValue(patientPath + ".extension[1].valueBoolean", new BooleanPIO(true))
        .setValue(
            patientPath + ".extension[2]",
            new UriPIO("https://fhir.kbv.de/StructureDefinition/KBV_EX_MIO_ULB_Notes_For_Communication")
        )
        .setValue(patientPath + ".extension[2].valueString", new StringPIO("Bitte nur leise mit dem Patienten reden."))
        .setValue(patientPath + ".name[0].use", new CodePIO("official"))
        .setValue(patientPath + ".name[0].text", new StringPIO("Dr. Peter Prinz von Stackelberg"))
        .setValue(patientPath + ".name[0].family", new StringPIO("Prinz von Stackelberg"))

        .setValue(
            patientPath + ".name[0].family.extension[0]",
            new UriPIO("http://fhir.de/StructureDefinition/humanname-namenszusatz")
        )
        .setValue(patientPath + ".name[0].family.extension[0].valueString", new StringPIO("Prinz"))
        .setValue(
            patientPath + ".name[0].family.extension[1]",
            new UriPIO("http://hl7.org/fhir/StructureDefinition/humanname-own-name")
        )
        .setValue(patientPath + ".name[0].family.extension[1].valueString", new UriPIO("Stackelberg"))
        .setValue(
            patientPath + ".name[0].family.extension[2]",
            new UriPIO("http://hl7.org/fhir/StructureDefinition/humanname-own-prefix")
        )
        .setValue(patientPath + ".name[0].family.extension[2].valueString", new StringPIO("von"))
        .setValue(patientPath + ".name[0].given", new StringPIO("Peter"))
        .setValue(patientPath + ".name[0].prefix", new StringPIO("Dr."))
        .setValue(
            patientPath + ".name[0].prefix.extension",
            new UriPIO("http://hl7.org/fhir/StructureDefinition/iso21090-EN-qualifier")
        )
        .setValue(patientPath + ".name[0].prefix.extension.valueCode", new CodePIO("AC"))
        .setValue(patientPath + ".name[1].use", new CodePIO("maiden"))
        .setValue(patientPath + ".name[1].text", new StringPIO("Graf Meyer"))
        .setValue(patientPath + ".name[1].family", new StringPIO("Graf Meyer"))
        .setValue(
            patientPath + ".name[1].family.extension[0]",
            new UriPIO("http://fhir.de/StructureDefinition/humanname-namenszusatz")
        )
        .setValue(patientPath + ".name[1].family.extension[0].valueString", new StringPIO("Graf"))
        .setValue(
            patientPath + ".name[1].family.extension[1]",
            new UriPIO("http://hl7.org/fhir/StructureDefinition/humanname-own-name")
        )
        .setValue(patientPath + ".name[1].family.extension[1].valueString", new StringPIO("Meyer"))
        .setValue(patientPath + telecomSystemPath, new StringPIO("phone"))
        .setValue(patientPath + telecomValuePath, new StringPIO("023578239"))
        .setValue(patientPath + ".telecom[1].system", new StringPIO("email"))
        .setValue(patientPath + ".telecom[1].value", new StringPIO("lol@gmx.de"))
        .setValue(patientPath + ".gender", new CodePIO("male"))
        .setValue(patientPath + ".gender.extension", new UriPIO("http://fhir.de/StructureDefinition/gender-amtlich-de"))
        .setValue(
            patientPath + ".gender.extension.valueCoding.system",
            new UriPIO("http://fhir.de/CodeSystem/gender-amtlich-de")
        )
        .setValue(patientPath + ".gender.extension.valueCoding.version", new StringPIO("1.3.2"))
        .setValue(patientPath + ".gender.extension.valueCoding.code", new CodePIO("D"))
        .setValue(patientPath + ".gender.extension.valueCoding.display", new StringPIO("divers"))
        .setValue(patientPath + ".birthDate", new DatePIO(1945, 4, 20))
        .setValue(
            patientPath + ".address[0].extension",
            new UriPIO("http://hl7.org/fhir/StructureDefinition/iso21090-ADXP-precinct")
        )
        .setValue(patientPath + ".address[0].extension.valueString", new UriPIO("Lechhausen"))
        .setValue(patientPath + ".address[0].use", new CodePIO("home"))
        .setValue(patientPath + ".address[0].type", new CodePIO("both"))
        .setValue(patientPath + ".address[0].text", new StringPIO("Tulpenstrasse 3c, Lechhausen, 86150 Augsburg, DE"))
        .setValue(patientPath + ".address[0].line[0]", new StringPIO("Tulpenstrasse 3c"))
        .setValue(
            patientPath + ".address[0].line[0].extension[0]",
            new UriPIO("http://hl7.org/fhir/StructureDefinition/iso21090-ADXP-streetName")
        )
        .setValue(patientPath + ".address[0].line[0].extension[0].valueString", new StringPIO("Tulpenstrasse"))
        .setValue(
            patientPath + ".address[0].line[0].extension[1]",
            new UriPIO("http://hl7.org/fhir/StructureDefinition/iso21090-ADXP-houseNumber")
        )
        .setValue(patientPath + ".address[0].line[0].extension[1].valueString", new StringPIO("3"))
        .setValue(
            patientPath + ".address[0].line[0].extension[2]",
            new UriPIO("http://hl7.org/fhir/StructureDefinition/iso21090-ADXP-additionalLocator")
        )
        .setValue(patientPath + ".address[0].line[0].extension[2].valueString", new StringPIO("c"))
        .setValue(patientPath + ".address[0].city", new StringPIO("Augsburg"))
        .setValue(patientPath + ".address[0].postalCode", new StringPIO("86150"))
        .setValue(patientPath + ".address[0].country", new StringPIO("DE"))
        .setValue(patientPath + ".communication[0].language.coding.system", new UriPIO("urn:ietf:bcp:47"))
        .setValue(patientPath + ".communication[0].language.coding.version", new StringPIO("4.0.1"))
        .setValue(patientPath + ".communication[0].language.coding.code", new CodePIO("de"))
        .setValue(patientPath + ".communication[0].language.coding.display", new StringPIO("German"))

        //Organization 1
        .setValue(
            organizationPath_1 + profileHeaderPath,
            new StringPIO("https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Organization")
        )
        .setValue(organizationPath_1 + ".@status@", new StringPIO("extensions"))
        .setValue(organizationPath_1 + ".@div@", new StringPIO("<h1><b>Sendende Einrichtung</b></h1>")) // Add narrative
        .setValue(organizationPath_1 + ".name", new StringPIO("Klinikum Augsburg"))
        .setValue(organizationPath_1 + telecomSystemPath, new CodePIO("phone"))
        .setValue(organizationPath_1 + telecomValuePath, new StringPIO("0821-2357346"))

        //Organization 2
        .setValue(
            organizationPath_2 + profileHeaderPath,
            new StringPIO("https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Organization")
        )
        .setValue(organizationPath_2 + ".@status@", new StringPIO("extensions"))
        .setValue(organizationPath_2 + ".@div@", new StringPIO("<h1>Empfangende Einrichtung</h1>")) // Add narrative
        .setValue(organizationPath_2 + ".name", new StringPIO("AWONIA Pflegeheim"))
        .setValue(organizationPath_2 + telecomSystemPath, new CodePIO("phone"))
        .setValue(organizationPath_2 + telecomValuePath, new StringPIO("0821-6242345"))

        //Observation resource KBV_PR_MIO_ULB_Observation_Care_Level
        .setValue(
            levelOfCarPath + ".extension[0]",
            new UriPIO("https://fhir.kbv.de/StructureDefinition/KBV_EX_MIO_ULB_Application_Status")
        )
        .setValue(levelOfCarPath + ".extension[0].extension[0]", new UriPIO("beantragungsdatum"))
        .setValue(levelOfCarPath + ".extension[0].extension[0].valueDateTime", new DateTimePIO(2023, 4, 2, 0, 0, 0))
        .setValue(levelOfCarPath + ".extension[0].extension[1]", new UriPIO("antragsstatusPflegegrad"))
        .setValue(
            levelOfCarPath + ".extension[0].extension[1].valueCodeableConcept.coding.system",
            new UriPIO("https://fhir.kbv.de/CodeSystem/KBV_CS_MIO_ULB_Application_Status_Care_Level")
        )
        .setValue(
            levelOfCarPath + ".extension[0].extension[1].valueCodeableConcept.coding.version",
            new StringPIO("1.0.0")
        )
        .setValue(
            levelOfCarPath + ".extension[0].extension[1].valueCodeableConcept.coding.code",
            new CodePIO("Beantragung_mit_Pflegegradzuweisung_abgeschlossen")
        )
        .setValue(
            levelOfCarPath + ".extension[0].extension[1].valueCodeableConcept.coding.display",
            new StringPIO("Beantragung mit Pflegegradzuweisung abgeschlossen")
        )
        .setValue(levelOfCarPath + ".status", new CodePIO("final"))
        .setValue(levelOfCarPath + ".code.coding.system", new CodePIO("http://loinc.org"))
        .setValue(levelOfCarPath + ".code.coding.version", new CodePIO("2.72"))
        .setValue(levelOfCarPath + ".code.coding.code", new CodePIO("80391-6"))
        .setValue(levelOfCarPath + ".code.coding.display", new StringPIO("Level of care [Type]"))
        .setValue(levelOfCarPath + ".subject.reference", new UuidPIO(patientID))
        .setValue(
            levelOfCarPath + ".valueCodeableConcept.coding.system",
            new UriPIO("http://fhir.de/CodeSystem/bfarm/ops")
        )
        .setValue(levelOfCarPath + ".valueCodeableConcept.coding.version", new StringPIO("1.0.0"))
        .setValue(levelOfCarPath + ".valueCodeableConcept.coding.code", new CodePIO("9-984.9"))
        .setValue(
            levelOfCarPath + ".valueCodeableConcept.coding.display",
            new StringPIO("Pflegebedürftig nach Pflegegrad 4")
        );

    //Generate header data
    pio.header
        .setTimestampBundle(new DateTimePIO(2022, 7, 30, 15, 12, 0))
        .setCompositionUuid(new UuidPIO("a1e1726e-b3ee-4584-8a7b-8ca53908f5e5"))
        .setBundleIdentifierUuid(new UuidPIO("9aa1e777-cc3e-419e-9395-382ab1374408"))
        .setBundleUuid(new UuidPIO("702d1550-d289-40df-b477-9dc23a91b243"))
        .addAuthor(new UuidPIO("b4d930e3-796c-43b7-829d-3daa951e879c"))
        .addAuthor(new UuidPIO("2369c2fb-1b7b-45be-b001-8268e417ec5c"))
        .setDateComposition(new DateTimePIO(2022, 7, 30, 15, 12, 0))
        .setPatient(new UuidPIO(patientID))
        .setReceivingInstitution(new UuidPIO(organizationID_2));

    return { xmlString: expectedXML, pio: pio };
};

describe("Tests for class 'RootObject'", () => {
    //---------- Tests ----------
    describe("Test for getAllUuids() method", () => {
        it("should return all uuids and their resource types", () => {
            expect(getDataForTesting().pio.getAllUuids()).toEqual({
                "2a73739e-7df1-4a61-a79d-8d95ae45a563": "KBV_PR_MIO_ULB_Observation_Care_Level",
                "39f928a1-52f6-4563-8918-214cb3b2b55f": "KBV_PR_MIO_ULB_Organization",
                "9d4b229e-40bf-4bca-8680-9657895363ea": "KBV_PR_MIO_ULB_Organization",
                "e029b2b8-5dc6-4feb-990a-7471fb9b54e3": "KBV_PR_MIO_ULB_Patient",
            });
        });
    });

    describe("Test 'toXml()' method", () => {
        describe("Test the generation of the xml string", () => {
            //Mock system time so that time stamp of the PIO Bundle matches the testing data
            jest.useFakeTimers().setSystemTime(new Date("2023-05-13T11:48:07"));

            //Mock uuid generation in toXML() method for auto-generated resources
            const uuids: string[] = [
                "acfe132b-ee66-4917-8694-cd60015480df",
                "035596d1-2d72-450d-b4cc-7fead566c979",
                "2029b394-4ccd-4acc-9141-cdf5a3bdd63a",
                "1d6d42a3-9f2f-4d30-8b1e-a62c0d066938",
                "cfd1bb31-c9fc-46cd-ab12-e20425fa22f4",
                "0d8bd5cd-cd71-4f48-a514-b28e648c541b",
                "601c01aa-b331-452e-a5f7-ccda91ce2d20",
                "039b5b81-4a3d-4d59-920e-6e62dda2752c",
            ].reverse();
            const spy: jest.SpyInstance = jest.spyOn(UuidPIO, "generateUuid");
            spy.mockImplementation((): string => {
                return uuids.pop() ?? "5e06018a-e25d-4f7e-8563-d386c98b2e9a";
            });

            //Generate xml string
            const testingData: { xmlString: string; pio: RootObject } = getDataForTesting();
            const output = testingData.pio.toXML();
            it("should be equal to the output of the toXml() method", () => {
                expect(output).toEqual(testingData.xmlString);
            });
        });

        describe("Test the functionality for invalid paths", () => {
            //Set some invalid paths
            const errorPio: RootObject = getDataForTesting().pio;
            errorPio.content.setValue(patientPath + ".funXmlTag", new StringPIO("lol"));
            errorPio.content.setValue(organizationPath_1 + ".teeelecom[1].system", new CodePIO("pager"));
            errorPio.content.setValue(organizationPath_1 + ".teeelecom[1].value", new StringPIO("14255368888"));

            it("should detect the invalid paths in the 'PathValidator", () => {
                expect(errorPio.content.pV.getInvalidPaths()).toEqual([
                    patientPath + ".funXmlTag",
                    organizationPath_1 + ".teeelecom[1].system",
                    organizationPath_1 + ".teeelecom[1].value",
                ]);
            });

            it("should throw an error, if invalid paths are detected", () => {
                expect(() => errorPio.toXML()).toThrow();
            });
        });
    });

    describe("Test readXML() method", () => {
        //Mock system time so that time stamp of the PIO Bundle matches the testing data
        jest.useFakeTimers().setSystemTime(new Date("2023-05-13T11:48:07"));

        //Mock uuid generation in toXML() method for auto-generated resources
        const uuids: string[] = [
            "acfe132b-ee66-4917-8694-cd60015480df",
            "035596d1-2d72-450d-b4cc-7fead566c979",
            "2029b394-4ccd-4acc-9141-cdf5a3bdd63a",
            "1d6d42a3-9f2f-4d30-8b1e-a62c0d066938",
            "cfd1bb31-c9fc-46cd-ab12-e20425fa22f4",
            "0d8bd5cd-cd71-4f48-a514-b28e648c541b",
            "601c01aa-b331-452e-a5f7-ccda91ce2d20",
            "039b5b81-4a3d-4d59-920e-6e62dda2752c",
        ].reverse();
        const spy: jest.SpyInstance = jest.spyOn(UuidPIO, "generateUuid");
        spy.mockImplementation((): string => {
            return uuids.pop() ?? "5e06018a-e25d-4f7e-8563-d386c98b2e9a";
        });

        const expectedXML: string = getDataForTesting().xmlString;
        const newXmlString: string = RootObject.readXML({ firstName: "test", lastName: "test" }, expectedXML).toXML();

        it("newXmlString should be equal to the original xml string", () => {
            expect(newXmlString).toEqual(expectedXML);
        });
    });

    describe("Test for SubTree integration", () => {
        describe("Get SubTree of path which doesn't exist so far. After saving path should exist", () => {
            const pio: RootObject = getDataForTesting().pio;
            const subTree: SubTree = pio.getSubTrees([organizationPath_1 + ".extension"])[0];
            const extUrl = "https://fhir.kbv.de/StructureDefinition/KBV_EX_Base_Additional_Comment";
            const comment = "Diese Einrichtung ist nur postalisch erreichbar.";

            it("should create the path when saving the subTree", () => {
                //Add extension data to SubTree
                subTree.setValue("", new UriPIO(extUrl));
                subTree.setValue("valueString", new StringPIO(comment));

                //Save SubTree
                pio.saveSubTrees([subTree]);

                expect(true).toEqual(true);

                //Test
                expect(
                    pio.content
                        .getValueByPath(organizationPath_1 + ".extension")
                        .get()
                        .toString()
                ).toEqual(extUrl);
                expect(
                    pio.content
                        .getValueByPath(organizationPath_1 + ".extension.valueString")
                        .get()
                        .toString()
                ).toEqual(comment);
            });
        });

        describe("Tests for getSubTrees() and saveSubTrees() methods", () => {
            const pio: RootObject = getDataForTesting().pio;
            it("should change data by getting a subTree, changing it and integrating it", () => {
                const subTree: SubTree[] = pio.getSubTrees([patientID + ".KBV_PR_MIO_ULB_Patient.name[0]"]);
                subTree[0].setValue("given", new StringPIO("Alexxander"));
                pio.saveSubTrees(subTree);
                const savedData: PrimitiveDataTypes = pio.content.getValueByPath(
                    patientID + ".KBV_PR_MIO_ULB_Patient.name[0].given"
                );
                expect(savedData).toEqual({ _value: "Alexxander" } as StringPIO);
            });
        });
    });

    describe("Test for deleteAllEmptyUuids() method", () => {
        it("should remove both organization resources because content was deleted", () => {
            //Create new pio with empty uuids
            const emptyPio: RootObject = new RootObject({ firstName: "test", lastName: "test" });
            emptyPio.content.data["c2dd0ae8-db4b-43b2-8dc8-e2c7159dc1be"] = { KBV_PR_MIO_ULB_Organization: {} };
            emptyPio.content.data["1d483aaf-7d95-4d81-a36a-350c6a602c73"] = {};

            const numberOfDeletions: number = emptyPio.deleteAllEmptyUuids();

            expect(numberOfDeletions).toEqual(2);
            expect(emptyPio.content.data).toEqual({});
        });
    });
});
/* eslint-enable sonarjs/no-duplicate-string */
