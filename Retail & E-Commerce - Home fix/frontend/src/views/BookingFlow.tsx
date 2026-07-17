import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useApp } from '../AppContext';
import { allServices } from '../data';
import { saveBooking } from '../lib/api';
import { LocationActions } from '../components/LocationActions';
import type { Booking } from '../types';

const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];

function getNext7Days() {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      dayName: dayNames[d.getDay()],
      date: d.getDate(),
      fullDate: d.toISOString().split('T')[0],
    });
  }
  return days;
}

export function BookingFlow() {
  const { state, goBack, navigate, dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('addr-1');
  const [notes, setNotes] = useState('');
  const [paymentOption, setPaymentOption] = useState<'advance' | 'full'>('advance');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const proId = state.navigationParams.professionalId;
  const serviceId = state.navigationParams.serviceId;
  const pro = state.professionals.find(p => p.id === proId);

  useEffect(() => {
    if (serviceId) {
      setSelectedService(serviceId);
    }
  }, [serviceId]);

  if (!pro) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center">
        <p className="text-sm" style={{ color: '#94A3B8' }}>Professional not found</p>
        <button onClick={goBack} className="mt-2 text-xs" style={{ color: '#FF6B5B' }}>Go Back</button>
      </div>
    );
  }

  const proServices = allServices.filter(s => pro.services.includes(s.id));
  const selectedServiceData = allServices.find(s => s.id === selectedService);
  const servicePrice = selectedServiceData?.price || 0;
  const platformFee = 49;
  const total = servicePrice + platformFee;
  const advanceAmount = Math.floor(total / 2);
  const dates = getNext7Days();
  const address = state.user?.addresses.find(a => a.id === selectedAddress);

  const canProceed = () => {
    if (step === 1) return !!selectedService;
    if (step === 2) return !!selectedDate && !!selectedTime;
    if (step === 3) return !!selectedAddress;
    return true;
  };

  const handleConfirm = () => {
    setIsConfirming(true);
    setTimeout(() => {
      setIsConfirming(false);
      setIsConfirmed(true);

      const newBooking: Booking = {
        id: `book-${Date.now()}`,
        serviceId: selectedService,
        serviceName: selectedServiceData?.name || '',
        categoryId: pro.category,
        professionalId: pro.id,
        professionalName: pro.name,
        professionalAvatar: pro.avatar,
        customerId: state.user?.id || '',
        status: 'confirmed',
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        price: total,
        address: address || state.user!.addresses[0],
        notes,
        progressPhotos: [],
        paymentStatus: paymentOption === 'advance' ? 'advance_paid' : 'completed',
        paymentAmount: paymentOption === 'advance' ? advanceAmount : total,
        createdAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_BOOKING', booking: newBooking });
      void saveBooking(newBooking).catch(() => undefined);
    }, 1500);
  };

  if (isConfirmed) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(78, 205, 196, 0.15)', animation: 'checkmarkPop 0.6s ease-out' }}
        >
          <Check size={40} color="#4ECDC4" strokeWidth={3} />
        </div>
        <h2 className="text-xl font-bold text-white mt-6">Booking Confirmed!</h2>
        <p className="text-xs mt-2" style={{ color: '#64748B' }}>#{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        <div className="w-full p-4 rounded-xl mt-6 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <img src={pro.avatar} alt={pro.name} className="w-12 h-12 rounded-full object-cover" />
          <div>
            <p className="text-sm font-semibold text-white">{pro.name}</p>
            <p className="text-xs" style={{ color: '#94A3B8' }}>{selectedServiceData?.name}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('mybookings')}
          className="w-full h-12 rounded-xl text-sm font-semibold text-white mt-6 tap-active-sm"
          style={{ background: '#FF6B5B', boxShadow: '0 2px 12px rgba(255, 107, 91, 0.3)' }}
        >
          Track Your Booking
        </button>
        <button onClick={() => navigate('home')} className="mt-4 text-sm tap-active" style={{ color: '#94A3B8' }}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(0, 2, 18, 0.85)', backdropFilter: 'blur(16px)' }}>
        <button onClick={step === 1 ? goBack : () => setStep(step - 1)} className="tap-active p-1">
          <ArrowLeft size={22} color="white" />
        </button>
        <h1 className="text-sm font-semibold text-white flex-1">Book Service</h1>
      </div>

      {/* Step Indicator */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Service' },
            { num: 2, label: 'Schedule' },
            { num: 3, label: 'Details' },
            { num: 4, label: 'Pay' },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: step > s.num ? 'rgba(78, 205, 196, 0.2)' : step === s.num ? 'rgba(255, 107, 91, 0.2)' : 'transparent',
                  border: `2px solid ${step > s.num ? '#4ECDC4' : step === s.num ? '#FF6B5B' : 'rgba(255,255,255,0.15)'}`,
                  color: step > s.num ? '#4ECDC4' : step === s.num ? '#FF6B5B' : '#64748B',
                }}
              >
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span className="text-[9px] mt-1 font-medium" style={{ color: step >= s.num ? '#94A3B8' : '#64748B' }}>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="flex mt-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 h-0.5 mx-1 rounded-full" style={{ background: step > i ? '#FF6B5B' : 'rgba(255,255,255,0.08)' }} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {step === 1 && (
          <div>
            <h2 className="text-base font-semibold text-white mb-4">Choose a Service</h2>
            <div className="space-y-3">
              {proServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  data-active={selectedService === service.id}
                  className="w-full p-4 rounded-xl flex items-start gap-3 text-left tap-active"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${selectedService === service.id ? 'rgba(255, 107, 91, 0.4)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{
                      border: `2px solid ${selectedService === service.id ? '#FF6B5B' : 'rgba(255,255,255,0.2)'}`,
                      background: selectedService === service.id ? '#FF6B5B' : 'transparent',
                    }}
                  >
                    {selectedService === service.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{service.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{service.description}</p>
                  </div>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: '#FF6B5B' }}>\u20b9{service.price}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-base font-semibold text-white mb-4">Select Date</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map((d) => (
                <button
                  key={d.fullDate}
                  onClick={() => setSelectedDate(d.fullDate)}
                  data-active={selectedDate === d.fullDate}
                  className="flex-shrink-0 w-16 py-2.5 rounded-xl flex flex-col items-center tap-active-sm"
                  style={{
                    background: selectedDate === d.fullDate ? 'rgba(255, 107, 91, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedDate === d.fullDate ? 'rgba(255, 107, 91, 0.4)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  <span className="text-[10px]" style={{ color: selectedDate === d.fullDate ? '#FF6B5B' : '#64748B' }}>{d.dayName}</span>
                  <span className="text-base font-bold mt-0.5" style={{ color: selectedDate === d.fullDate ? '#FF6B5B' : 'white' }}>{d.date}</span>
                </button>
              ))}
            </div>

            <h2 className="text-base font-semibold text-white mt-6 mb-4">Select Time Slot</h2>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  data-active={selectedTime === slot}
                  className="py-2.5 rounded-lg text-xs font-medium tap-active-sm"
                  style={{
                    background: selectedTime === slot ? 'rgba(255, 107, 91, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedTime === slot ? 'rgba(255, 107, 91, 0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: selectedTime === slot ? '#FF6B5B' : 'white',
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-base font-semibold text-white mb-4">Service Address</h2>
            <div className="mb-3">
              <LocationActions
                selectedAddress={address}
                onAddressSelected={(currentAddress) => setSelectedAddress(currentAddress.id)}
              />
            </div>
            <div className="space-y-3">
              {state.user?.addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr.id)}
                  data-active={selectedAddress === addr.id}
                  className="w-full p-4 rounded-xl flex items-start gap-3 text-left tap-active"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${selectedAddress === addr.id ? 'rgba(255, 107, 91, 0.4)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                    style={{
                      border: `2px solid ${selectedAddress === addr.id ? '#FF6B5B' : 'rgba(255,255,255,0.2)'}`,
                      background: selectedAddress === addr.id ? '#FF6B5B' : 'transparent',
                    }}
                  >
                    {selectedAddress === addr.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="text-xs font-semibold" style={{ color: '#FF6B5B' }}>{addr.label}</span>
                    <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>{addr.full}</p>
                  </div>
                </button>
              ))}
            </div>

            <h2 className="text-base font-semibold text-white mt-6 mb-4">Special Instructions</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific requirements? (e.g., boat neck, elbow sleeves...)"
              rows={4}
              className="w-full p-4 rounded-xl text-sm text-white placeholder-[#64748B] outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-base font-semibold text-white mb-4">Booking Summary</h2>
            <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: '#64748B' }}>Service</span>
                  <span className="text-xs text-white">{selectedServiceData?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: '#64748B' }}>Professional</span>
                  <div className="flex items-center gap-1.5">
                    <img src={pro.avatar} alt={pro.name} className="w-5 h-5 rounded-full object-cover" />
                    <span className="text-xs text-white">{pro.name}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: '#64748B' }}>Schedule</span>
                  <span className="text-xs text-white">{selectedDate} at {selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: '#64748B' }}>Address</span>
                  <span className="text-xs text-white text-right max-w-[60%]">{address?.label} - {address?.full}</span>
                </div>
              </div>
              <div className="h-px my-3" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: '#64748B' }}>Service Fee</span>
                  <span className="text-sm font-semibold text-white">\u20b9{servicePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: '#64748B' }}>Platform Fee</span>
                  <span className="text-xs text-white">\u20b9{platformFee}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-sm font-semibold text-white">Total</span>
                  <span className="text-lg font-bold" style={{ color: '#FF6B5B' }}>\u20b9{total}</span>
                </div>
              </div>
            </div>

            <h2 className="text-base font-semibold text-white mt-6 mb-4">Payment Method</h2>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentOption('advance')}
                data-active={paymentOption === 'advance'}
                className="w-full p-4 rounded-xl flex items-start gap-3 text-left tap-active"
                style={{
                  background: paymentOption === 'advance' ? 'rgba(255, 107, 91, 0.05)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${paymentOption === 'advance' ? 'rgba(255, 107, 91, 0.4)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                  style={{
                    border: `2px solid ${paymentOption === 'advance' ? '#FF6B5B' : 'rgba(255,255,255,0.2)'}`,
                    background: paymentOption === 'advance' ? '#FF6B5B' : 'transparent',
                  }}
                >
                  {paymentOption === 'advance' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Pay Advance (50%)</p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>Pay \u20b9{advanceAmount} now, rest after service</p>
                </div>
              </button>
              <button
                onClick={() => setPaymentOption('full')}
                data-active={paymentOption === 'full'}
                className="w-full p-4 rounded-xl flex items-start gap-3 text-left tap-active"
                style={{
                  background: paymentOption === 'full' ? 'rgba(255, 107, 91, 0.05)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${paymentOption === 'full' ? 'rgba(255, 107, 91, 0.4)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                  style={{
                    border: `2px solid ${paymentOption === 'full' ? '#FF6B5B' : 'rgba(255,255,255,0.2)'}`,
                    background: paymentOption === 'full' ? '#FF6B5B' : 'transparent',
                  }}
                >
                  {paymentOption === 'full' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Pay Full Amount</p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>Complete payment of \u20b9{total} now</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(0, 2, 18, 0.9)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="text-sm font-medium tap-active" style={{ color: '#94A3B8' }}>
            Back
          </button>
        ) : <div />}
        {step < 4 ? (
          <button
            onClick={() => canProceed() && setStep(step + 1)}
            disabled={!canProceed()}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white tap-active-sm disabled:opacity-40"
            style={{ background: '#FF6B5B', boxShadow: '0 2px 12px rgba(255, 107, 91, 0.3)' }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white tap-active-sm flex items-center gap-2"
            style={{ background: '#FF6B5B', boxShadow: '0 2px 12px rgba(255, 107, 91, 0.3)' }}
          >
            {isConfirming && <Loader2 size={14} className="animate-spin" />}
            {isConfirming ? 'Confirming...' : 'Confirm Booking'}
          </button>
        )}
      </div>
    </div>
  );
}
