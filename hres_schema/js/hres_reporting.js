/* Haplo Research Manager                             http://haplo.org
 * (c) Haplo Services Ltd 2006 - 2016    http://www.haplo-services.com
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.         */


P.implementService("std:reporting:collection_category:hres:people:setup", function(collection) {
    collection.
        indexedFact("nameSortAs", "text", "Sorting by name").
        indexedFact("faculty", "ref", NAME('Faculty')).
        indexedFact("department", "ref", NAME('Department')).   // facts included regardless of institute depth for consistency
        indexedFact("school", "ref", NAME('School'));
});

P.implementService("std:reporting:collection_category:hres:people:get_facts_for_object", function(object, row) {
    // Use name of person to create a string to use for sorting
    var title = object.first(A.Title);
    if(O.typecode(title) === O.T_TEXT_PERSON_NAME) {
        var fields = title.toFields();
        row.nameSortAs = _.compact([fields.last, fields.first, fields.title]).join(", ").toLowerCase();
    } else {
        row.nameSortAs = title.toString().toLowerCase();
    }
    var institute = object.first(A.ResearchInstitute), safety = 256;
    while(institute && (safety--) > 0) {
        var i = institute.load();
        if(i.isKindOf(T.Faculty)) {
            row.faculty = institute;
        } else if(i.isKindOf(T.Department)) {
            row.department = institute;
        } else if(i.isKindOf(T.School)) {
            row.school = institute;
        }
        institute = i.firstParent();
    }
});

// --------------------------------------------------------------------------

var PERSON_EXPORT_COLUMNS = [{fact:"ref", type:"ref-person-name", heading:"Name"}, "faculty"];
if(P.INSTITUTE_DEPTH > 1) { PERSON_EXPORT_COLUMNS.push("department"); }
if(P.INSTITUTE_DEPTH > 2) { PERSON_EXPORT_COLUMNS.push("school"); }

var makePersonDashboardColumns = function(spec) {
    var columns = [
        {fact:"ref", type:"ref-person-name", link:true, heading:(spec.heading || "Name")}
    ];
    if(P.INSTITUTE_DEPTH > 1) {
        columns.push({
            type:"join",
            style:"medium",
            joinWith:" : ",
            heading:NAME('Faculty')+" : "+NAME('Department'),
            columns: [
                {fact:"faculty", shortestTitle:true},
                {fact:"department", shortestTitle:true}
            ]
        });
    } else {
        columns.push({fact:"faculty", shortestTitle:true});
    }
    return columns;
};

P.reporting.registerReportingFeature("hres:person_name_column", function(dashboard, spec) {
    dashboard.
        columns(10, dashboard.isExporting ? PERSON_EXPORT_COLUMNS : makePersonDashboardColumns(spec || {})).
        order("nameSortAs").
        use("std:row_text_filter", {facts:["ref"], placeholder:"Search by name"}).
        use("std:row_object_filter", {fact:"faculty", objects:T.Faculty});
    if(P.INSTITUTE_DEPTH > 1) {
        dashboard.use("std:row_object_filter", {fact:"department", objects:T.Department});
    }
});
