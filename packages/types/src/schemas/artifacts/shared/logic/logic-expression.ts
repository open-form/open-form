/**
 * Logic Expression types for typed computed values
 *
 * These types correspond to the LogicExpression schema in @open-form/schemas.
 */

// ============================================================================
// Base Types
// ============================================================================

/**
 * Base interface for all logic expressions with common metadata.
 */
export interface BaseLogicExpression {
  /** Display label for the computed value */
  label?: string;
  /** Description or documentation of the computed value */
  description?: string;
}

// ============================================================================
// Scalar Logic Expressions (value is a single expression string)
// ============================================================================

/**
 * Boolean logic expression.
 * Evaluates to a boolean value.
 */
export interface BooleanLogicExpression extends BaseLogicExpression {
  type: 'boolean';
  /** Expression that evaluates to a boolean */
  value: string;
}

/**
 * String logic expression.
 * Evaluates to a string value.
 */
export interface StringLogicExpression extends BaseLogicExpression {
  type: 'string';
  /** Expression that evaluates to a string */
  value: string;
}

/**
 * Number logic expression.
 * Evaluates to a numeric value.
 */
export interface NumberLogicExpression extends BaseLogicExpression {
  type: 'number';
  /** Expression that evaluates to a number */
  value: string;
}

/**
 * Integer logic expression.
 * Evaluates to an integer value.
 */
export interface IntegerLogicExpression extends BaseLogicExpression {
  type: 'integer';
  /** Expression that evaluates to an integer */
  value: string;
}

/**
 * Percentage logic expression.
 * Evaluates to a percentage value (0-100).
 */
export interface PercentageLogicExpression extends BaseLogicExpression {
  type: 'percentage';
  /** Expression that evaluates to a percentage */
  value: string;
}

/**
 * Rating logic expression.
 * Evaluates to a rating value.
 */
export interface RatingLogicExpression extends BaseLogicExpression {
  type: 'rating';
  /** Expression that evaluates to a rating */
  value: string;
}

/**
 * Date logic expression.
 * Evaluates to an ISO 8601 date string (YYYY-MM-DD).
 */
export interface DateLogicExpression extends BaseLogicExpression {
  type: 'date';
  /** Expression that evaluates to a date string */
  value: string;
}

/**
 * Time logic expression.
 * Evaluates to a time string (HH:MM:SS).
 */
export interface TimeLogicExpression extends BaseLogicExpression {
  type: 'time';
  /** Expression that evaluates to a time string */
  value: string;
}

/**
 * Datetime logic expression.
 * Evaluates to an ISO 8601 datetime string.
 */
export interface DatetimeLogicExpression extends BaseLogicExpression {
  type: 'datetime';
  /** Expression that evaluates to a datetime string */
  value: string;
}

/**
 * Duration logic expression.
 * Evaluates to an ISO 8601 duration string.
 */
export interface DurationLogicExpression extends BaseLogicExpression {
  type: 'duration';
  /** Expression that evaluates to a duration string */
  value: string;
}

// ============================================================================
// Object Logic Expressions (value is an object with expression strings)
// ============================================================================

/**
 * Money logic expression value structure.
 */
export interface MoneyLogicExpressionValue {
  /** Expression for the monetary amount */
  amount: string;
  /** Expression for the currency code (ISO 4217) */
  currency: string;
}

/**
 * Money logic expression.
 * Evaluates to a Money object with amount and currency.
 */
export interface MoneyLogicExpression extends BaseLogicExpression {
  type: 'money';
  /** Object with expressions for money components */
  value: MoneyLogicExpressionValue;
}

/**
 * Address logic expression value structure.
 */
export interface AddressLogicExpressionValue {
  /** Expression for primary address line */
  line1: string;
  /** Expression for secondary address line (optional) */
  line2?: string;
  /** Expression for city/locality */
  locality: string;
  /** Expression for state/region */
  region: string;
  /** Expression for postal/ZIP code */
  postalCode: string;
  /** Expression for country */
  country: string;
}

/**
 * Address logic expression.
 * Evaluates to an Address object.
 */
export interface AddressLogicExpression extends BaseLogicExpression {
  type: 'address';
  /** Object with expressions for address components */
  value: AddressLogicExpressionValue;
}

/**
 * Phone logic expression value structure.
 */
export interface PhoneLogicExpressionValue {
  /** Expression for phone number (E.164 format) */
  number: string;
  /** Expression for phone type (optional) */
  type?: string;
  /** Expression for extension (optional) */
  extension?: string;
}

/**
 * Phone logic expression.
 * Evaluates to a Phone object.
 */
export interface PhoneLogicExpression extends BaseLogicExpression {
  type: 'phone';
  /** Object with expressions for phone components */
  value: PhoneLogicExpressionValue;
}

/**
 * Coordinate logic expression value structure.
 */
export interface CoordinateLogicExpressionValue {
  /** Expression for latitude */
  lat: string;
  /** Expression for longitude */
  lon: string;
}

/**
 * Coordinate logic expression.
 * Evaluates to a Coordinate object.
 */
export interface CoordinateLogicExpression extends BaseLogicExpression {
  type: 'coordinate';
  /** Object with expressions for coordinate components */
  value: CoordinateLogicExpressionValue;
}

/**
 * Bbox logic expression value structure.
 */
export interface BboxLogicExpressionValue {
  /** Expression for northern boundary latitude */
  north: string;
  /** Expression for southern boundary latitude */
  south: string;
  /** Expression for eastern boundary longitude */
  east: string;
  /** Expression for western boundary longitude */
  west: string;
}

/**
 * Bbox (bounding box) logic expression.
 * Evaluates to a Bbox object.
 */
export interface BboxLogicExpression extends BaseLogicExpression {
  type: 'bbox';
  /** Object with expressions for bbox boundaries */
  value: BboxLogicExpressionValue;
}

/**
 * Person logic expression value structure.
 */
export interface PersonLogicExpressionValue {
  /** Expression for full name */
  fullName: string;
  /** Expression for title/prefix (optional) */
  title?: string;
  /** Expression for first name (optional) */
  firstName?: string;
  /** Expression for middle name (optional) */
  middleName?: string;
  /** Expression for last name (optional) */
  lastName?: string;
  /** Expression for suffix (optional) */
  suffix?: string;
}

/**
 * Person logic expression.
 * Evaluates to a Person object.
 */
export interface PersonLogicExpression extends BaseLogicExpression {
  type: 'person';
  /** Object with expressions for person name components */
  value: PersonLogicExpressionValue;
}

/**
 * Organization logic expression value structure.
 */
export interface OrganizationLogicExpressionValue {
  /** Expression for organization name */
  name: string;
  /** Expression for legal name (optional) */
  legalName?: string;
  /** Expression for domicile (optional) */
  domicile?: string;
  /** Expression for entity type (optional) */
  entityType?: string;
  /** Expression for entity ID (optional) */
  entityId?: string;
  /** Expression for tax ID (optional) */
  taxId?: string;
}

/**
 * Organization logic expression.
 * Evaluates to an Organization object.
 */
export interface OrganizationLogicExpression extends BaseLogicExpression {
  type: 'organization';
  /** Object with expressions for organization components */
  value: OrganizationLogicExpressionValue;
}

/**
 * Identification logic expression value structure.
 */
export interface IdentificationLogicExpressionValue {
  /** Expression for ID type */
  type: string;
  /** Expression for ID number */
  number: string;
  /** Expression for issuer (optional) */
  issuer?: string;
  /** Expression for issue date (optional) */
  issueDate?: string;
  /** Expression for expiry date (optional) */
  expiryDate?: string;
}

/**
 * Identification logic expression.
 * Evaluates to an Identification object.
 */
export interface IdentificationLogicExpression extends BaseLogicExpression {
  type: 'identification';
  /** Object with expressions for identification components */
  value: IdentificationLogicExpressionValue;
}

// ============================================================================
// Union Type
// ============================================================================

/**
 * Scalar logic expression types (value is a single expression string).
 */
export type ScalarLogicExpression =
  | BooleanLogicExpression
  | StringLogicExpression
  | NumberLogicExpression
  | IntegerLogicExpression
  | PercentageLogicExpression
  | RatingLogicExpression
  | DateLogicExpression
  | TimeLogicExpression
  | DatetimeLogicExpression
  | DurationLogicExpression;

/**
 * Object logic expression types (value is an object with property expressions).
 */
export type ObjectLogicExpression =
  | MoneyLogicExpression
  | AddressLogicExpression
  | PhoneLogicExpression
  | CoordinateLogicExpression
  | BboxLogicExpression
  | PersonLogicExpression
  | OrganizationLogicExpression
  | IdentificationLogicExpression;

/**
 * A typed computed value with optional metadata (label, description).
 * The type property determines the expected result type and value schema.
 */
export type LogicExpression = ScalarLogicExpression | ObjectLogicExpression;

/**
 * Type of a scalar logic expression.
 */
export type ScalarLogicType =
  | 'boolean'
  | 'string'
  | 'number'
  | 'integer'
  | 'percentage'
  | 'rating'
  | 'date'
  | 'time'
  | 'datetime'
  | 'duration';

/**
 * Type of an object logic expression.
 */
export type ObjectLogicType =
  | 'money'
  | 'address'
  | 'phone'
  | 'coordinate'
  | 'bbox'
  | 'person'
  | 'organization'
  | 'identification';

/**
 * All supported logic expression types.
 */
export type LogicExpressionType = ScalarLogicType | ObjectLogicType;
