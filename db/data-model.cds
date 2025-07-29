namespace db;

entity Aircraft {
  key tailNumber  : String(10);
      model       : String(50);
      lastCheck   : Date;
      nextCheck   : Date;
      flightHours : Integer;
}

type FlightStatusEnum : String enum {
  READY;
  SCHEDULED;
  IN_FLIGHT;
  OUT_OF_ORDER;
  UNDER_MAINTENANCE;
  CANCELLED;
}

entity flightStatus {
  key flightNumber : String;
      tailNumber     : String(10);
      departure    : String;
      arrival      : String;
      status       : FlightStatusEnum;
}


type MaintenanceStatusEnum : String enum {
  PENDING;
  IN_PROGRESS;
  COMPLETED;
  OVERDUE;
}

entity maintenanceQueue {
  key maintenanceID : String(10);
      tailNumber      : String(10);
      issueDetected : String;
      source        : String(50);
      status        : MaintenanceStatusEnum;
      assignedTo    : String(50);
      deadline      : Date;
}

type BookingStatusEnum : String enum {
  CONFIRMED;
  CANCELLED;
  CHECKED_IN;
}

entity booking {
  key bookingID    : String(10);
      user         : String(10);
      flightNumber : String;
      seatNumber   : String(5);
      mealPref     : String(30);
      accessibility: String(50);
      loyaltyID    : String(10);
      status       : BookingStatusEnum;
}

type LoyaltyTierEnum : String enum {
  BASIC;
  KRISFLYER_ELITE_SILVER;
  KRISFLYER_ELITE_GOLD;
  PPS_CLUB;
}

entity User {
  key userID        : String(10);
      name          : String(100);
      email         : String(100);
      phone         : String(20);
      loyaltyTier   : LoyaltyTierEnum;
      preferences   : String(100);
      pastBookings  : Integer;
}

type PricingStatusEnum : String enum {
  BLOCKED;
  NORMAL;
  DISCOUNTED;
}

entity pricingAndCapacity {
  key pricingID     : String(10);                  
      flight        : String;  
      totalSeats    : Integer;                      
      bookedSeats   : Integer;                      
      occupancyPct  : Decimal(5,2);                 
      currentPrice  : Decimal(10,2);                
      lastUpdated   : Timestamp;                    
      status        : PricingStatusEnum;            
}
