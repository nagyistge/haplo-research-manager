/* Haplo Research Manager                             http://haplo.org
 * (c) Haplo Services Ltd 2006 - 2016    http://www.haplo-services.com
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.         */

/*

    Support for NAME() for basic schema objects, with plural support.

    List of type names below will be translated to the name of the type in the schema.

    Prefix with '+' for the plural version, eg
        NAME('Faculty') -> Faculty
        NAME('+Faculty') -> Faculties

    The pluraliser is very simple, and is intended to be extended as requirements
    are discovered.
*/

var NAMES = {
    "Researcher":           ["getTypeInfo", T, "Researcher"],
    "Staff":                ["getTypeInfo", T, "Staff"],
    "Research Institute":   ["getTypeInfo", T, "ResearchInstitute"],
    "University":           ["getTypeInfo", T, "University"],
    "Faculty":              ["getTypeInfo", T, "Faculty"],
    "Department":           ["getTypeInfo", T, "Department"],
    "School":               ["getTypeInfo", T, "School"],
    "Research Group":       ["getTypeInfo", T, "ResearchGroup"]
};

P.implementService("std:NAME", function(name) {
    var t = maybeTranslate(name);
    if(t) {
        return t;
    } else if(name.length > 1 && name.charAt(0) === '+') {
        // Plural version
        t = maybeTranslate(name.substring(1));
        if(t) {
            return pluralise(t);
        }
    }
});

var maybeTranslate = function(name) {
    var i = NAMES[name];
    if(i) {
        return SCHEMA[i[0]](i[1][i[2]]).name;
    }
};

var pluralise = function(name) {
    var match = name.match(/^(.+)y$/);
    if(match) {
        return match[1]+'ies';
    }
    return name+'s';
};

// --------------------------------------------------------------------------
// Allow other plugins to add to the base schema NAMES

var feature = {
    pluralise: pluralise,
    addTypeNamesFromSchema: function(pluginT, names) {
        _.each(names, function(n) { NAMES[n[0]] = ['getTypeInfo', pluginT, n[1]]; });
    },
    addAttributeNamesFromSchema: function(pluginA, names) {
        _.each(names, function(n) { NAMES[n[0]] = ['getAttributeInfo', pluginA, n[1]]; });
    }
};

P.provideFeature("hres:schema:names", function(plugin) {
    plugin.hresSchemaNAME = feature;
});
