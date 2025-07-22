sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'project1/test/integration/FirstJourney',
		'project1/test/integration/pages/AircraftList',
		'project1/test/integration/pages/AircraftObjectPage'
    ],
    function(JourneyRunner, opaJourney, AircraftList, AircraftObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('project1') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheAircraftList: AircraftList,
					onTheAircraftObjectPage: AircraftObjectPage
                }
            },
            opaJourney.run
        );
    }
);