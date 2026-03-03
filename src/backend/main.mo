import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Order "mo:core/Order";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    role : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller.notEqual(user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Menu Item Type
  type MenuItem = {
    id : Text;
    name : Text;
    price : Float;
    quantity : Nat;
    imageUrl : Text;
    dayOfWeek : Text;
    description : Text;
    category : Text;
  };

  module MenuItem {
    public func compare(item1 : MenuItem, item2 : MenuItem) : Order.Order {
      switch (Float.compare(item1.price, item2.price)) {
        case (#equal) { Text.compare(item1.name, item2.name) };
        case (order) { order };
      };
    };
  };

  // Order Types
  type OrderItem = {
    itemId : Text;
    quantity : Nat;
  };

  type OrderType = {
    #dineIn;
    #takeaway;
  };

  type PaymentMethod = {
    #cash;
    #online;
  };

  type OrderStatus = {
    #pending;
    #preparing;
    #ready;
    #delivered;
  };

  type PaymentStatus = {
    #paid;
    #pending;
  };

  type Order = {
    id : Text;
    items : [OrderItem];
    orderType : OrderType;
    paymentMethod : PaymentMethod;
    customerName : Text;
    timestamp : Time.Time;
    status : OrderStatus;
    estimatedTime : Nat;
    paymentStatus : PaymentStatus;
    totalAmount : Float;
  };

  // Rating Type
  type Rating = {
    itemId : Text;
    rating : Nat;
    comment : Text;
    timestamp : Time.Time;
  };

  // State
  let menuItems = Map.empty<Text, MenuItem>();
  let orders = Map.empty<Text, Order>();
  let ratings = Map.empty<Text, [Rating]>();
  var orderCounter : Nat = 0;

  // Menu Management - No Auth Check
  public shared ({ caller }) func addMenuItem(item : MenuItem) : async () {
    let existing = menuItems.get(item.id);
    switch (existing) {
      case (null) {
        menuItems.add(item.id, item);
      };
      case (?_) {
        Runtime.trap("Item with this ID already exists");
      };
    };
  };

  public shared ({ caller }) func updateMenuItem(id : Text, updatedItem : MenuItem) : async () {
    let existing = menuItems.get(id);
    switch (existing) {
      case (null) {
        Runtime.trap("Item not found");
      };
      case (?_) {
        menuItems.add(id, updatedItem);
      };
    };
  };

  public shared ({ caller }) func removeMenuItem(id : Text) : async () {
    let existed = menuItems.containsKey(id);
    menuItems.remove(id);
    if (not existed) {
      Runtime.trap("Item not found");
    };
  };

  // Bulk Menu Management for Frontend Seeding - No Auth Check
  public shared ({ caller }) func seedMenuItems(items : [MenuItem]) : async () {
    for (item in items.values()) {
      menuItems.add(item.id, item);
    };
  };

  // Menu Queries - Public
  public query ({ caller }) func getMenuByDay(dayOfWeek : Text) : async [MenuItem] {
    menuItems.values().toArray().filter(func(item) { Text.equal(item.dayOfWeek, dayOfWeek) });
  };

  public query ({ caller }) func getAllMenuItems() : async [MenuItem] {
    menuItems.values().toArray();
  };

  public query ({ caller }) func getMenuItem(id : Text) : async ?MenuItem {
    menuItems.get(id);
  };

  public query func getMenuItemCount() : async Nat {
    menuItems.size();
  };

  // Order Management - No Auth Check (Anonymous Allowed)
  public shared ({ caller }) func placeOrder(
    items : [OrderItem],
    orderType : OrderType,
    paymentMethod : PaymentMethod,
    customerName : Text,
  ) : async Text {
    // Calculate total and validate items
    var totalAmount : Float = 0;
    for (orderItem in items.vals()) {
      switch (menuItems.get(orderItem.itemId)) {
        case (null) {
          Runtime.trap("Item not found: " # orderItem.itemId);
        };
        case (?menuItem) {
          if (menuItem.quantity < orderItem.quantity) {
            Runtime.trap("Insufficient quantity for item: " # menuItem.name);
          };
          totalAmount += menuItem.price * orderItem.quantity.toFloat();

          // Decrease quantity
          let updatedItem = {
            id = menuItem.id;
            name = menuItem.name;
            price = menuItem.price;
            quantity = menuItem.quantity - orderItem.quantity : Nat;
            imageUrl = menuItem.imageUrl;
            dayOfWeek = menuItem.dayOfWeek;
            description = menuItem.description;
            category = menuItem.category;
          };
          menuItems.add(menuItem.id, updatedItem);
        };
      };
    };

    orderCounter += 1;
    let orderId = "VVWU-" # orderCounter.toText();

    let order : Order = {
      id = orderId;
      items = items;
      orderType = orderType;
      paymentMethod = paymentMethod;
      customerName = customerName;
      timestamp = Time.now();
      status = #pending;
      estimatedTime = 15; // Default 15 minutes
      paymentStatus = switch (paymentMethod) {
        case (#online) { #paid };
        case (#cash) { #pending };
      };
      totalAmount = totalAmount;
    };

    orders.add(orderId, order);
    orderId;
  };

  // Order Queries - Public
  public query ({ caller }) func getOrder(orderId : Text) : async ?Order {
    orders.get(orderId);
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    orders.values().toArray();
  };

  public query ({ caller }) func getQueueOrders() : async [Order] {
    // Public query - anyone can see the queue
    orders.values().toArray().filter(func(order) {
      switch (order.status) {
        case (#pending or #preparing or #ready) { true };
        case (_) { false };
      };
    });
  };

  // Order Status Management - No Auth Check
  public shared ({ caller }) func updateOrderStatus(orderId : Text, status : OrderStatus) : async () {
    switch (orders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        let updatedOrder = {
          id = order.id;
          items = order.items;
          orderType = order.orderType;
          paymentMethod = order.paymentMethod;
          customerName = order.customerName;
          timestamp = order.timestamp;
          status = status;
          estimatedTime = order.estimatedTime;
          paymentStatus = order.paymentStatus;
          totalAmount = order.totalAmount;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func updateEstimatedTime(orderId : Text, estimatedTime : Nat) : async () {
    switch (orders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        let updatedOrder = {
          id = order.id;
          items = order.items;
          orderType = order.orderType;
          paymentMethod = order.paymentMethod;
          customerName = order.customerName;
          timestamp = order.timestamp;
          status = order.status;
          estimatedTime = estimatedTime;
          paymentStatus = order.paymentStatus;
          totalAmount = order.totalAmount;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func markOrderAsDelivered(orderId : Text) : async () {
    switch (orders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        let updatedOrder = {
          id = order.id;
          items = order.items;
          orderType = order.orderType;
          paymentMethod = order.paymentMethod;
          customerName = order.customerName;
          timestamp = order.timestamp;
          status = #delivered;
          estimatedTime = order.estimatedTime;
          paymentStatus = order.paymentStatus;
          totalAmount = order.totalAmount;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func markPaymentAsPaid(orderId : Text) : async () {
    switch (orders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        let updatedOrder = {
          id = order.id;
          items = order.items;
          orderType = order.orderType;
          paymentMethod = order.paymentMethod;
          customerName = order.customerName;
          timestamp = order.timestamp;
          status = order.status;
          estimatedTime = order.estimatedTime;
          paymentStatus = #paid;
          totalAmount = order.totalAmount;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getOrdersByDate(date : Time.Time) : async [Order] {
    // Filter all orders for the specific date (simplified: same day)
    orders.values().toArray().filter(func(order) {
      order.timestamp >= date and order.timestamp < date + 86_400_000_000_000;
    });
  };

  public query ({ caller }) func getSalesSummary(date : Time.Time) : async { totalOrders : Nat; totalRevenue : Float } {
    let dayOrders = orders.values().toArray().filter(func(order) {
      // Simplified date comparison (in production, use proper date handling)
      order.timestamp >= date and order.timestamp < date + 86_400_000_000_000;
    });

    var totalRevenue : Float = 0;
    for (order in dayOrders.vals()) {
      totalRevenue += order.totalAmount;
    };

    { totalOrders = dayOrders.size(); totalRevenue = totalRevenue };
  };

  public query ({ caller }) func getOrdersByDateRange(startDate : Time.Time, endDate : Time.Time) : async [Order] {
    orders.values().toArray().filter(func(order) {
      order.timestamp >= startDate and order.timestamp <= endDate;
    });
  };

  // Rating Management - No Auth Check (Anonymous Allowed)
  public shared ({ caller }) func addRating(rating : Rating) : async () {
    if (rating.rating < 1 or rating.rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    switch (menuItems.get(rating.itemId)) {
      case (null) {
        Runtime.trap("Item not found");
      };
      case (?_) {
        let existingRatings = switch (ratings.get(rating.itemId)) {
          case (?r) { r };
          case (null) { [] };
        };
        let newRatings = existingRatings.concat([rating]);
        ratings.add(rating.itemId, newRatings);
      };
    };
  };

  // Rating Queries - Public
  public query ({ caller }) func getRatingsForItem(itemId : Text) : async [Rating] {
    switch (ratings.get(itemId)) {
      case (?r) { r };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getAverageRating(itemId : Text) : async Float {
    switch (ratings.get(itemId)) {
      case (?r) {
        if (r.size() == 0) { return 0 };
        let sum = r.foldLeft(0, func(acc, rating) { acc + rating.rating });
        sum.toFloat() / r.size().toFloat();
      };
      case (null) { 0 };
    };
  };
};
