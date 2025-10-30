import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { FiCreditCard, FiLock } from 'react-icons/fi';
import { SiVisa, SiMastercard, SiAmericanexpress } from 'react-icons/si';

interface PaymentFormProps {
  onBack: () => void;
  onSubmit: (paymentData: PaymentData) => void;
  appointmentFee?: number;
}

export interface PaymentData {
  cardholderName: string;
  country: string;
  cardNumber: string;
  expirationDate: string;
  securityCode: string;
  agreeToTerms: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  onBack,
  onSubmit,
  appointmentFee = 5.00
}) => {
  const [cardholderName, setCardholderName] = useState('');
  const [country, setCountry] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const countries = [
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France',
    'Japan',
    'Singapore',
    'United Arab Emirates',
    'Sri Lanka',
    'India'
  ];

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\s/g, '').replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(' ') : numbers;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  // Format expiration date MM / YY
  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + ' / ' + value.slice(2, 4);
    }
    setExpirationDate(value);
  };

  const handleSecurityCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setSecurityCode(value);
    }
  };

  const isFormValid = 
    cardholderName.trim() !== '' &&
    country !== '' &&
    cardNumber.replace(/\s/g, '').length === 16 &&
    expirationDate.replace(/\s/g, '').length === 4 &&
    securityCode.length === 3 &&
    agreeToTerms;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit({
        cardholderName,
        country,
        cardNumber,
        expirationDate,
        securityCode,
        agreeToTerms
      });
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center mb-4">
          <FiCreditCard size={24} className="me-2 text-primary" />
          <h5 className="mb-0 fw-semibold">Payment Information</h5>
        </div>

        <div className="alert alert-info mb-4">
          <div className="d-flex align-items-center">
            <FiLock className="me-2" />
            <small>Your payment information is secure and encrypted</small>
          </div>
        </div>

        {/* Payment Amount */}
        <div className="bg-light p-3 rounded mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-semibold">Appointment Booking Fee:</span>
            <span className="fs-4 fw-bold text-primary">${appointmentFee.toFixed(2)}</span>
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          {/* Cardholder Name */}
          <Form.Group className="mb-3">
            <Form.Label>
              Cardholder Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="John Smith"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              required
            />
          </Form.Group>

          {/* Country or Region */}
          <Form.Group className="mb-3">
            <Form.Label>
              Country or Region <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            >
              <option value="">Select country</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Card Number */}
          <Form.Group className="mb-3">
            <Form.Label>
              Card Number <span className="text-danger">*</span>
            </Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="1234 1234 1234 1234"
                value={cardNumber}
                onChange={handleCardNumberChange}
                required
                style={{ paddingRight: '100px' }}
              />
              <div style={{ 
                position: 'absolute', 
                right: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                display: 'flex',
                gap: '8px',
                zIndex: 10
              }}>
                <SiVisa size={32} color="#1A1F71" />
                <SiMastercard size={32} color="#EB001B" />
                <SiAmericanexpress size={32} color="#006FCF" />
              </div>
            </InputGroup>
          </Form.Group>

          {/* Expiration Date and Security Code */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Expiration Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="MM / YY"
                  value={expirationDate}
                  onChange={handleExpirationChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  Security Code <span className="text-danger">*</span>
                </Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="CVC"
                    value={securityCode}
                    onChange={handleSecurityCodeChange}
                    required
                  />
                  <InputGroup.Text>
                    <div style={{
                      width: '40px',
                      height: '24px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f8f9fa'
                    }}>
                      <small className="fw-bold">123</small>
                    </div>
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          {/* Terms Agreement */}
          <Form.Group className="mb-4">
            <Form.Check
              type="checkbox"
              id="terms-checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              label={
                <small>
                  You agree that we will charge your card in the amount above now and on a 
                  recurring monthly basis until you cancel in accordance with our terms. 
                  You can cancel at any time in your account settings.
                </small>
              }
              required
            />
          </Form.Group>

          {/* Action Buttons */}
          <div className="d-flex gap-3">
            <Button
              variant="outline-secondary"
              onClick={onBack}
            >
              Back
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={!isFormValid}
              className="ms-auto"
            >
              Complete Booking
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PaymentForm;
