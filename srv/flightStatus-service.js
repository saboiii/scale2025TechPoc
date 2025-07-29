const axios = require('axios');

module.exports = srv => {
  const { flightStatus } = srv.entities;

  srv.on('checkAndSchedule', async req => {
    const { flightNumber } = req.data;

    if (!flightNumber) return req.error(400, 'flightNumber is required.');

    const flight = await SELECT.one.from(flightStatus).where({ flightNumber });
    if (!flight) return req.error(404, `Flight ${flightNumber} not found.`);

    if (flight.status !== 'READY') {
      return `Flight ${flightNumber} is not READY (current status: ${flight.status}).`;
    }

    const maxRetries = 5;
    let retries = 0;
    let approved = false;

    while (retries < maxRetries) {
      try {
        const res = await axios.get('https://sap-scale-mockapi.vercel.app/api/getflightStatus');
        const controlStatus = res.data.status?.toUpperCase();

        if (controlStatus === 'APPROVE') {
          approved = true;
          break;
        }

        // Wait 30 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 30000));
        retries++;

      } catch (e) {
        console.error(e);
        return req.error(500, 'Failed to reach flight control API.');
      }
    }

    if (approved) {
      await UPDATE(flightStatus)
        .set({ status: 'IN_FLIGHT' })
        .where({ flightNumber });

      return `Flight ${flightNumber} approved and now set to IN_FLIGHT.`;
    } else {
      return `Flight ${flightNumber} not approved after ${maxRetries} attempts.`;
    }
  });
};
