sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";
    return Controller.extend("project1.controller.Overview", {
        scheduleQueue: [],
        flightStatusList: [],

        onInit: function () {
            // Role-based access control
            var oGlobalModel = this.getOwnerComponent().getModel("global");
            var role = oGlobalModel ? oGlobalModel.getProperty("/role") : "";
            if (role !== "admin") {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Login", {}, true);
                return;
            }
            // Always load mock data from local JSON with logging
            var oMockModel = new sap.ui.model.json.JSONModel();
            oMockModel.loadData("model/maintenance-Aircraft.json", null, true);
            oMockModel.attachRequestCompleted(function () {
                console.log("Aircraft data loaded:", oMockModel.getProperty("/Aircraft"));
            });
            this.getOwnerComponent().setModel(oMockModel, undefined); // override default model
        },

        onSchedulePress: function (oEvent) {
            var oButton = oEvent.getSource();
            var sTailNumber = oButton.data("TailNumber");
            var oModel = this.getView().getModel();
            var aAircraft = oModel.getProperty("/Aircraft");
            var oAircraft = aAircraft.find(function (item) { return item.tailNumber === sTailNumber; });
            // Check if a flightStatus entity with SCHEDULED status already exists for this aircraft
            var alreadyScheduled = this.flightStatusList.some(function (fs) {
                return fs.aircraft === sTailNumber && fs.status === "SCHEDULED";
            });
            if (oAircraft && !alreadyScheduled) {
                // Create flightStatus entity for this aircraft
                var flightStatus = {
                    flightNumber: "FLIGHT-" + sTailNumber + "-" + Date.now(),
                    aircraft: sTailNumber,
                    departure: "TBD",
                    arrival: "TBD",
                    status: "SCHEDULED"
                };
                this.flightStatusList.push(flightStatus);
                // Add to schedule queue
                this.scheduleQueue.push(flightStatus);
                // Mark aircraft as scheduled for button disabling
                oAircraft._scheduled = true;
                oModel.setProperty("/Aircraft", aAircraft);
                // Update ScheduleQueue in the model for the card
                oModel.setProperty("/ScheduleQueue", this.scheduleQueue.slice());
                // Log the queue
                console.log("Schedule Queue:", this.scheduleQueue);
                MessageToast.show("Aircraft " + sTailNumber + " added to scheduling queue!");
                // Pop and process the next item in the queue
                this.processQueue();
            }
        },

        processQueue: function () {
            var oModel = this.getView().getModel();
            if (this.scheduleQueue.length > 0) {
                var nextFlight = this.scheduleQueue[0]; // Don't pop yet
                console.log("Processing flight:", nextFlight);
                // Call BPA API (replace with your endpoint)
                fetch("https://your-bpa-api/schedule", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tailNumber: nextFlight.aircraft, status: nextFlight.status })
                })
                    .then(function (response) { return response.json(); })
                    .then(function (data) {
                        console.log("BPA API response:", data);
                        // Only remove from queue if successful
                        this.scheduleQueue.shift();
                        // Update ScheduleQueue in the model for the card
                        oModel.setProperty("/ScheduleQueue", this.scheduleQueue.slice());
                    }.bind(this))
                    .catch(function (err) {
                        console.error("BPA API error:", err);
                        // Do not remove from queue
                    });
            }
        },

        onPostNextQueueItem: function () {
            var oModel = this.getView().getModel();
            if (this.scheduleQueue.length > 0) {
                var nextFlight = this.scheduleQueue[0]; // Don't pop yet
                console.log("Manually posting flight to BPA API:", nextFlight);
                fetch("https://your-bpa-api/schedule", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tailNumber: nextFlight.aircraft, status: nextFlight.status })
                })
                    .then(function (response) { return response.json(); })
                    .then(function (data) {
                        console.log("BPA API response:", data);
                        // Only remove from queue if successful
                        this.scheduleQueue.shift();
                        oModel.setProperty("/ScheduleQueue", this.scheduleQueue.slice());
                        MessageToast.show("Posted and removed flight " + nextFlight.flightNumber + " from queue.");
                    }.bind(this))
                    .catch(function (err) {
                        console.error("BPA API error:", err);
                        MessageToast.show("Failed to post flight " + nextFlight.flightNumber + ". Still in queue.");
                    });
            } else {
                MessageToast.show("No flights in the queue to post.");
            }
        },

        onRemoveQueueItem: function (oEvent) {
            var oButton = oEvent.getSource();
            var iIndex = parseInt(oButton.data("QueueIndex"), 10);
            var sTailNumber = oButton.data("TailNumber");
            var oModel = this.getView().getModel();
            // Remove from scheduleQueue by tailNumber (in case index is stale)
            var removed = false;
            for (var i = 0; i < this.scheduleQueue.length; i++) {
                if (this.scheduleQueue[i].aircraft === sTailNumber) {
                    this.scheduleQueue.splice(i, 1);
                    removed = true;
                    break;
                }
            }
            oModel.setProperty("/ScheduleQueue", this.scheduleQueue.slice());
            // Remove flightStatus entity for this aircraft
            this.flightStatusList = this.flightStatusList.filter(function (fs) {
                return !(fs.aircraft === sTailNumber && fs.status === "SCHEDULED");
            });
            // Re-enable Schedule button for this aircraft
            var aAircraft = oModel.getProperty("/Aircraft");
            var oAircraft = aAircraft.find(function (item) { return item.tailNumber === sTailNumber; });
            if (oAircraft) {
                oAircraft._scheduled = false;
                oModel.setProperty("/Aircraft", aAircraft);
            }
            if (removed) {
                MessageToast.show("Removed flight for " + sTailNumber + " from queue.");
            } else {
                MessageToast.show("Could not find flight for " + sTailNumber + " in queue.");
            }
        }
    });
});