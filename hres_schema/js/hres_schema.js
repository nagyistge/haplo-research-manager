/* Haplo Research Manager                             http://haplo.org
 * (c) Haplo Services Ltd 2006 - 2016    http://www.haplo-services.com
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.         */


P.onResearchInstituteChange = [];

P.hook("hPostObjectChange", function(response, object, operation) {
    if(object.isKindOf(T.ResearchInstitute)) {
        P.onResearchInstituteChange.forEach(function(fn) { fn(object); });
    }
});
