using MaintenanceService as service from '../../srv/cat-service';
annotate service.Aircraft with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'tailNumber',
                Value : tailNumber,
            },
            {
                $Type : 'UI.DataField',
                Label : 'model',
                Value : model,
            },
            {
                $Type : 'UI.DataField',
                Label : 'lastCheck',
                Value : lastCheck,
            },
            {
                $Type : 'UI.DataField',
                Label : 'nextCheck',
                Value : nextCheck,
            },
            {
                $Type : 'UI.DataField',
                Label : 'flightHours',
                Value : flightHours,
            }
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ]
);

