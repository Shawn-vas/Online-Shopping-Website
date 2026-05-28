'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowLeft, ArrowRight, User, MapPin, CreditCard, Wallet, Banknote, Check, Landmark, Truck, Map as MapIcon, ChevronRight } from 'lucide-react';
import styles from './page.module.css';
import networkData from '@/data/delivery-network.json';
import { findOptimalDeliveryPath } from '@/lib/algorithms/graph';

const STEPS = ['Details', 'Address', 'Delivery Route', 'Payment'];

export default function Checkout() {
  const router = useRouter();
  const { cart, subtotal, discountInfo, clearCart } = useCart();
  const { discountAmount, finalTotal } = discountInfo;
  const grandTotal = finalTotal;

  const [currentStep, setCurrentStep] = useState(0);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    notes: '',
    paymentMethod: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    cardName: '',
    upiId: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const selectPayment = (method) => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
    if (errors.paymentMethod) {
      setErrors(prev => ({ ...prev, paymentMethod: '' }));
    }
  };

  // Validation per step
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 0) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Enter a valid 10-digit number';
    }

    if (step === 1) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.pincode.trim()) newErrors.pincode = 'PIN code is required';
      else if (!/^\d{6}$/.test(formData.pincode.replace(/\s/g, ''))) newErrors.pincode = 'Enter a valid 6-digit PIN code';
    }

    if (step === 2) {
      // Delivery route step requires no input validation
    }

    if (step === 3) {
      if (!formData.paymentMethod) newErrors.paymentMethod = 'Select a payment method';
      if (formData.paymentMethod === 'card') {
        if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
        if (!formData.cardExpiry.trim()) newErrors.cardExpiry = 'Expiry date is required';
        if (!formData.cardCVV.trim()) newErrors.cardCVV = 'CVV is required';
        if (!formData.cardName.trim()) newErrors.cardName = 'Name on card is required';
      }
      if (formData.paymentMethod === 'upi') {
        if (!formData.upiId.trim()) newErrors.upiId = 'UPI ID is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handlePlaceOrder = () => {
    if (validateStep(currentStep)) {
      clearCart();
      setCheckoutComplete(true);
    }
  };

  // Generate a random order ID
  const orderId = `LUXE-${Date.now().toString(36).toUpperCase()}`;

  // --- SUCCESS STATE ---
  if (checkoutComplete) {
    return (
      <div className={`${styles.successContainer} container section-padding`}>
        <div className={styles.successIconWrapper}>
          <Check size={48} />
        </div>
        <h1 className="text-display-hero" style={{ fontSize: '3rem', marginBottom: '24px' }}>
          Order Confirmed
        </h1>
        <p className={styles.successText}>
          Thank you, {formData.firstName}! Your order has been placed successfully. You will receive a confirmation at <strong>{formData.email}</strong>.
        </p>
        <div className={styles.orderDetails}>
          <div className={styles.orderDetailRow}>
            <span className={styles.orderDetailLabel}>Order ID</span>
            <span className={styles.orderDetailValue}>{orderId}</span>
          </div>
          <div className={styles.orderDetailRow}>
            <span className={styles.orderDetailLabel}>Delivery To</span>
            <span className={styles.orderDetailValue}>{formData.firstName} {formData.lastName}</span>
          </div>
          <div className={styles.orderDetailRow}>
            <span className={styles.orderDetailLabel}>Address</span>
            <span className={styles.orderDetailValue}>{formData.city}, {formData.state} - {formData.pincode}</span>
          </div>
          <div className={styles.orderDetailRow}>
            <span className={styles.orderDetailLabel}>Payment</span>
            <span className={styles.orderDetailValue} style={{ textTransform: 'capitalize' }}>
              {formData.paymentMethod === 'card' ? 'Credit/Debit Card' :
               formData.paymentMethod === 'upi' ? 'UPI' :
               formData.paymentMethod === 'netbanking' ? 'Net Banking' : 'Cash on Delivery'}
            </span>
          </div>
          <div className={styles.orderDetailRow}>
            <span className={styles.orderDetailLabel}>Total Paid</span>
            <span className={styles.orderDetailValue} style={{ color: 'var(--primary)', fontWeight: '700' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <Link href="/shop" className="btn-primary" style={{ marginTop: '20px' }}>
          Continue Exploring
        </Link>
      </div>
    );
  }

  // --- EMPTY CART REDIRECT ---
  if (cart.length === 0) {
    return (
      <div className={`${styles.emptyContainer} container section-padding`}>
        <ShoppingBag size={48} className={styles.emptyIcon} />
        <h1 className="text-headline-lg" style={{ marginBottom: '20px' }}>
          Nothing to Checkout
        </h1>
        <p className={styles.emptyText}>
          Your shopping bag is empty. Add items before proceeding to checkout.
        </p>
        <Link href="/shop" className="btn-primary" style={{ marginTop: '24px' }}>
          Explore Collections
        </Link>
      </div>
    );
  }

  // --- FORM STEPS ---
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className={styles.formSection} key="step-details">
            <div className={styles.formSectionTitle}>
              <User size={22} />
              <h2>Personal Details</h2>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.firstName ? styles.inputError : ''}`}
                />
                {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.lastName ? styles.inputError : ''}`}
                />
                {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="yourname@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.phone ? styles.inputError : ''}`}
                />
                {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className={styles.formSection} key="step-address">
            <div className={styles.formSectionTitle}>
              <MapPin size={22} />
              <h2>Shipping Address</h2>
            </div>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.formLabel} htmlFor="address">Street Address</label>
                <textarea
                  id="address"
                  name="address"
                  placeholder="House/Flat No., Building, Street"
                  value={formData.address}
                  onChange={handleChange}
                  className={`${styles.formInput} ${styles.formTextarea} ${errors.address ? styles.inputError : ''}`}
                />
                {errors.address && <span className={styles.errorText}>{errors.address}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="city">City</label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`${styles.formInput} ${styles.formSelect} ${errors.city ? styles.inputError : ''}`}
                >
                  <option value="">Select a city</option>
                  {networkData.nodes.map(node => (
                    <option key={node.id} value={node.id}>{node.id}</option>
                  ))}
                </select>
                {errors.city && <span className={styles.errorText}>{errors.city}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="state">State</label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="Enter your state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.state ? styles.inputError : ''}`}
                />
                {errors.state && <span className={styles.errorText}>{errors.state}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="pincode">PIN Code</label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  placeholder="6-digit PIN code"
                  value={formData.pincode}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.pincode ? styles.inputError : ''}`}
                />
                {errors.pincode && <span className={styles.errorText}>{errors.pincode}</span>}
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="country">Country</label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={`${styles.formInput} ${styles.formSelect}`}
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="UAE">UAE</option>
                  <option value="Singapore">Singapore</option>
                </select>
              </div>
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.formLabel} htmlFor="notes">Order Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="Special delivery instructions, gift messages, etc."
                  value={formData.notes}
                  onChange={handleChange}
                  className={`${styles.formInput} ${styles.formTextarea}`}
                />
              </div>
            </div>
          </div>
        );

      case 2: {
        const routeData = findOptimalDeliveryPath(networkData, formData.city);
        
        return (
          <div className={styles.formSection} key="step-delivery">
            <div className={styles.formSectionTitle}>
              <MapIcon size={22} />
              <h2>Delivery Route Optimization</h2>
            </div>
            
            <p className={styles.routeDesc}>
              Using <strong>Dijkstra's Algorithm</strong>, our system has determined the most optimal delivery path from our luxury warehouses to <strong>{formData.city}</strong>, minimizing both transit time and logistical cost.
            </p>
            
            {routeData ? (
              <div className={styles.routeVisualizer}>
                <div className={styles.routeStats}>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Total Distance</span>
                    <span className={styles.statValue}>{routeData.totalDistance} km</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Logistics Cost</span>
                    <span className={styles.statValue}>₹{routeData.totalCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Est. Delivery</span>
                    <span className={styles.statValue}>{Math.ceil(routeData.totalTime / 24)} {Math.ceil(routeData.totalTime / 24) === 1 ? 'Day' : 'Days'}</span>
                  </div>
                </div>
                
                <div className={styles.pathMap}>
                  {routeData.path.map((node, index) => (
                    <React.Fragment key={node}>
                      <div className={styles.pathNode}>
                        <div className={`${styles.nodeCircle} ${index === 0 ? styles.nodeWarehouse : index === routeData.path.length - 1 ? styles.nodeDestination : styles.nodeTransit}`}>
                          {index === 0 ? <Truck size={14} /> : index === routeData.path.length - 1 ? <MapPin size={14} /> : index + 1}
                        </div>
                        <span className={styles.nodeName}>{node}</span>
                        <span className={styles.nodeType}>
                          {index === 0 ? 'Warehouse' : index === routeData.path.length - 1 ? 'Destination' : 'Transit Hub'}
                        </span>
                      </div>
                      
                      {index < routeData.path.length - 1 && (
                        <div className={styles.pathEdge}>
                          <div className={styles.edgeLine} />
                          <ChevronRight size={16} className={styles.edgeIcon} />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.routeError}>
                <p>Sorry, we could not calculate a delivery route to your selected city. Please choose a different city.</p>
              </div>
            )}
          </div>
        );
      }

      case 3:
        return (
          <div className={styles.formSection} key="step-payment">
            <div className={styles.formSectionTitle}>
              <CreditCard size={22} />
              <h2>Payment Method</h2>
            </div>

            {errors.paymentMethod && <p className={styles.errorText} style={{ marginBottom: '16px' }}>{errors.paymentMethod}</p>}

            <div className={styles.paymentOptions}>
              <label
                className={`${styles.paymentCard} ${formData.paymentMethod === 'card' ? styles.paymentCardSelected : ''}`}
                htmlFor="pay-card"
              >
                <input type="radio" id="pay-card" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={() => selectPayment('card')} />
                <CreditCard size={28} className={styles.paymentIcon} />
                <span className={styles.paymentLabel}>Credit / Debit</span>
                <span className={styles.paymentDesc}>Visa, Mastercard, RuPay</span>
              </label>

              <label
                className={`${styles.paymentCard} ${formData.paymentMethod === 'upi' ? styles.paymentCardSelected : ''}`}
                htmlFor="pay-upi"
              >
                <input type="radio" id="pay-upi" name="paymentMethod" value="upi" checked={formData.paymentMethod === 'upi'} onChange={() => selectPayment('upi')} />
                <Wallet size={28} className={styles.paymentIcon} />
                <span className={styles.paymentLabel}>UPI</span>
                <span className={styles.paymentDesc}>GPay, PhonePe, Paytm</span>
              </label>

              <label
                className={`${styles.paymentCard} ${formData.paymentMethod === 'netbanking' ? styles.paymentCardSelected : ''}`}
                htmlFor="pay-netbanking"
              >
                <input type="radio" id="pay-netbanking" name="paymentMethod" value="netbanking" checked={formData.paymentMethod === 'netbanking'} onChange={() => selectPayment('netbanking')} />
                <Landmark size={28} className={styles.paymentIcon} />
                <span className={styles.paymentLabel}>Net Banking</span>
                <span className={styles.paymentDesc}>All major banks</span>
              </label>

              <label
                className={`${styles.paymentCard} ${formData.paymentMethod === 'cod' ? styles.paymentCardSelected : ''}`}
                htmlFor="pay-cod"
              >
                <input type="radio" id="pay-cod" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={() => selectPayment('cod')} />
                <Banknote size={28} className={styles.paymentIcon} />
                <span className={styles.paymentLabel}>Cash on Delivery</span>
                <span className={styles.paymentDesc}>Pay when delivered</span>
              </label>
            </div>

            {/* Card Details */}
            {formData.paymentMethod === 'card' && (
              <div className={styles.cardDetails}>
                <div className={styles.formGrid}>
                  <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                    <label className={styles.formLabel} htmlFor="cardNumber">Card Number</label>
                    <input
                      id="cardNumber"
                      name="cardNumber"
                      type="text"
                      placeholder="XXXX  XXXX  XXXX  XXXX"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      className={`${styles.formInput} ${errors.cardNumber ? styles.inputError : ''}`}
                      maxLength={19}
                    />
                    {errors.cardNumber && <span className={styles.errorText}>{errors.cardNumber}</span>}
                  </div>
                  <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                    <label className={styles.formLabel} htmlFor="cardName">Name on Card</label>
                    <input
                      id="cardName"
                      name="cardName"
                      type="text"
                      placeholder="As it appears on card"
                      value={formData.cardName}
                      onChange={handleChange}
                      className={`${styles.formInput} ${errors.cardName ? styles.inputError : ''}`}
                    />
                    {errors.cardName && <span className={styles.errorText}>{errors.cardName}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="cardExpiry">Expiry Date</label>
                    <input
                      id="cardExpiry"
                      name="cardExpiry"
                      type="text"
                      placeholder="MM / YY"
                      value={formData.cardExpiry}
                      onChange={handleChange}
                      className={`${styles.formInput} ${errors.cardExpiry ? styles.inputError : ''}`}
                      maxLength={7}
                    />
                    {errors.cardExpiry && <span className={styles.errorText}>{errors.cardExpiry}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="cardCVV">CVV</label>
                    <input
                      id="cardCVV"
                      name="cardCVV"
                      type="password"
                      placeholder="•••"
                      value={formData.cardCVV}
                      onChange={handleChange}
                      className={`${styles.formInput} ${errors.cardCVV ? styles.inputError : ''}`}
                      maxLength={4}
                    />
                    {errors.cardCVV && <span className={styles.errorText}>{errors.cardCVV}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* UPI ID */}
            {formData.paymentMethod === 'upi' && (
              <div className={styles.cardDetails}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="upiId">UPI ID</label>
                  <input
                    id="upiId"
                    name="upiId"
                    type="text"
                    placeholder="yourname@upi"
                    value={formData.upiId}
                    onChange={handleChange}
                    className={`${styles.formInput} ${errors.upiId ? styles.inputError : ''}`}
                  />
                  {errors.upiId && <span className={styles.errorText}>{errors.upiId}</span>}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${styles.checkoutContainer} container section-padding`}>
      {/* Back to Cart */}
      <div className={styles.backWrapper}>
        <Link href="/cart" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to Shopping Bag</span>
        </Link>
      </div>

      <h1 className={`${styles.title} text-headline-lg`}>Checkout</h1>

      {/* Progress Stepper */}
      <div className={styles.stepper}>
        {STEPS.map((step, idx) => (
          <React.Fragment key={step}>
            <div className={`${styles.step} ${idx === currentStep ? styles.stepActive : ''} ${idx < currentStep ? styles.stepCompleted : ''}`}>
              <div className={styles.stepCircle}>
                {idx < currentStep ? <Check size={18} /> : idx + 1}
              </div>
              <span className={styles.stepLabel}>{step}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`${styles.stepConnector} ${idx < currentStep ? styles.stepConnectorActive : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className={styles.layoutGrid}>
        {/* Left: Form */}
        <div className={styles.formColumn}>
          {renderStep()}

          {/* Navigation */}
          <div className={styles.formActions}>
            {currentStep > 0 ? (
              <button onClick={prevStep} className={styles.btnBack}>
                <ArrowLeft size={16} />
                Back
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < STEPS.length - 1 ? (
              <button onClick={nextStep} className={`btn-primary ${styles.btnNext}`}>
                Continue
                <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={handlePlaceOrder} className={`btn-primary ${styles.btnNext}`}>
                Place Order
                <Check size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className={styles.summaryColumn}>
          <div className={styles.sidebarSummary}>
            <h3 className={`${styles.sidebarTitle} text-label-caps`}>Order Summary</h3>

            <div className={styles.sidebarItems}>
              {cart.map(item => (
                <div key={item.id} className={styles.sidebarItem}>
                  <img src={item.image} alt={item.name} className={styles.sidebarItemImage} />
                  <div className={styles.sidebarItemInfo}>
                    <p className={styles.sidebarItemName}>{item.name}</p>
                    <span className={styles.sidebarItemMeta}>Qty: {item.quantity} &bull; ₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.sidebarDivider} />

            <div className={styles.sidebarRow}>
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            {discountAmount > 0 && (
              <div className={`${styles.sidebarRow} ${styles.sidebarDiscount}`}>
                <span>Coupon Discount</span>
                <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className={styles.sidebarRow}>
              <span>Shipping</span>
              <span style={{ color: 'var(--secondary)' }}>Complimentary</span>
            </div>

            <div className={styles.sidebarDivider} />

            <div className={styles.sidebarTotalRow}>
              <span>Total</span>
              <span className={styles.sidebarTotalPrice}>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
