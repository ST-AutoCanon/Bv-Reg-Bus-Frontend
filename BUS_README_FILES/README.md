# Dashboard Module – Vehicle Submission Application

## 1. Overview

The Dashboard module allows authenticated users to view and manage their vehicle submissions.

It displays all requests associated with the logged-in user and provides functionality to:

- View all previously created vehicle requests.
- Create a new vehicle submission.
- Open an existing submission and continue editing.
- View submission status.
- View request creation and last-updated dates.
- Refresh the submission list.
- Display related table documents for a selected submission.

The Dashboard is implemented using React, TypeScript, React Hooks, and React Router.

## 2. Technologies Used

- React
- TypeScript
- React Hooks (`useState`, `useEffect`, `useCallback`)
- React Router (`useNavigate`)
- Browser Local Storage
- Fetch API
- REST API
- Backend authentication using Bearer Token

## 3. Dashboard Initialization

When the user opens the Dashboard, the application performs the following operations:

1. Retrieves the authentication token from browser Local Storage.
2. Initializes the dashboard state.
3. Calls the submissions API.
4. Retrieves the logged-in user's submissions.
5. Stores the API response in React state.
6. Displays the submission records in a dashboard table.

### Authentication Token Retrieval

**Function:** `getStoredToken()`

The function retrieves the authentication token from Local Storage.

It first checks the Redux persisted state:

`localStorage.getItem("persist:root")`

It attempts to retrieve the token from the following properties:

- `loginCredential.token`
- `loginCredential.accessToken`
- `loginCredential.userData.token`
- `loginCredential.user.token`
- `root.token`
- `root.accessToken`

If the token is not available in the persisted Redux state, it checks:

`localStorage.getItem("token")`

The retrieved token is stored in React state:

```typescript
const [token] = useState<string | null>(() => getStoredToken());
```

The token is subsequently included in API requests using the Authorization header.

```http
Authorization: Bearer YOUR_TOKEN
```

If no token is found, the Dashboard displays an authentication error and asks the user to sign in again.

## 4. Dashboard State Management

The Dashboard uses React `useState` to manage application data and UI behavior.

| State                 | Type                  | Description                                  |
| --------------------- | --------------------- | -------------------------------------------- |
| `token`               | `string \| null`      | Stores the authentication token.             |
| `user`                | `User \| null`        | Stores optional logged-in user information.  |
| `submissions`         | `Submission[]`        | Stores the user's submission records.        |
| `loading`             | `boolean`             | Controls initial dashboard loading.          |
| `submissionsLoading`  | `boolean`             | Controls submission API loading.             |
| `showNewRequest`      | `boolean`             | Controls visibility of the new request form. |
| `editingSubmissionId` | `string \| undefined` | Stores the currently selected submission ID. |
| `documentsRefreshKey` | `number`              | Triggers refresh of related table documents. |
| `error`               | `string`              | Stores API and application error messages.   |

## 5. Fetching User Submissions

**Function:** `fetchSubmissions()`

This function retrieves all submissions belonging to the authenticated user.

### API Details

**Method:** GET

**Endpoint:**

```http
GET http://localhost:3000/api/bus/submissions/allrequests
```

**Request Headers:**

```http
Authorization: Bearer YOUR_TOKEN
Accept: application/json
Cache-Control: no-cache
Pragma: no-cache
```

### Backend Processing

The frontend sends the authenticated GET request to the backend.

The backend:

1. Validates the authenticated user.
2. Retrieves submissions belonging to that user.
3. Sorts the submissions by creation date in descending order.
4. Returns the submission records to the frontend.

The backend service uses:

```javascript
export const getMySubmissions = async (userId) => {
  validateUser(userId);

  return Submission.find({ userId }).sort({ createdAt: -1 }).lean();
};
```

### Example API Response

The following is an illustrative response based on the submission records used in the application:

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "6ae55b6db27bad44534dd2db",
      "userId": "6ac904b235db72e9c9367e2c",
      "requestInfo": {
        "vehicleType": "BUS",
        "fuelType": "electric",
        "certificationType": "type-approval",
        "unloadedWeightWithoutBattery": "101",
        "category": "L5",
        "preferredTestingAgency": "GARC"
      },
      "values": {},
      "status": "draft",
      "createdAt": "2026-10-31T03:07:25.012Z",
      "updatedAt": "2026-10-31T03:07:25.012Z",
      "__v": 0
    },
    {
      "_id": "6ae2ad73b27bad44534dd239",
      "userId": "6ac904b235db72e9c9367e2c",
      "requestInfo": {
        "vehicleType": "Bus",
        "fuelType": "electric",
        "certificationType": "type-approval",
        "unloadedWeightWithoutBattery": "99",
        "category": "L5",
        "preferredTestingAgency": "GARC"
      },
      "values": {},
      "status": "draft",
      "createdAt": "2026-10-29T02:20:35.121Z",
      "updatedAt": "2026-10-31T02:58:18.368Z",
      "__v": 0
    }
  ]
}
```

The `values` objects are shortened in this example. The actual API response can contain the complete submission form data.

### Frontend Response Processing

The frontend supports either `data` or `submissions` as the response array:

```typescript
const result = Array.isArray(data.data)
  ? data.data
  : Array.isArray(data.submissions)
    ? data.submissions
    : null;
```

After successful validation of the response:

```typescript
setSubmissions(result);
```

If user information is returned:

```typescript
if (data.user) {
  setUser(data.user);
}
```

If the API response does not contain a valid submissions array, an error is displayed.

## 6. Displaying Submission Records

The Dashboard displays the retrieved submissions in a table.

Each submission is rendered using:

```typescript
submissions.map((submission, index) => {
  // Render submission row
});
```

### Dashboard Table Columns

| Column   | Backend Field             | Description                                           |
| -------- | ------------------------- | ----------------------------------------------------- |
| Request  | `_id`                     | Displays request number and submission ID.            |
| Vehicle  | `requestInfo.vehicleType` | Displays vehicle type.                                |
| Fuel     | `requestInfo.fuelType`    | Displays fuel type.                                   |
| Category | `requestInfo.category`    | Displays vehicle category.                            |
| Status   | `status`                  | Displays Draft or Completed.                          |
| Created  | `createdAt`               | Displays creation date and time.                      |
| Updated  | `updatedAt`               | Displays last modification date and time.             |
| Action   | `_id`                     | Provides the Open button for the selected submission. |

### Status Display

The Dashboard checks the submission status:

```typescript
submission.status === "completed" ? "Completed" : "Draft";
```

- `draft`: The submission is saved as a draft.
- `completed`: All required form fields have been completed according to the backend validation logic.

**Note:** Completed does not necessarily mean that the request has been officially submitted, approved, or certified.

### Date Formatting

The Dashboard uses two helper functions:

- `formatDate()` – Converts the timestamp into a localized date.
- `formatTime()` – Converts the timestamp into a localized time.

If a timestamp is missing or invalid, the function displays an appropriate fallback value.

## 7. Creating a New Vehicle Request

**Function:** `handleNewRequest()`

When the user clicks the **New Request** button, the Dashboard opens the `NewRequest` component.

```typescript
const handleNewRequest = () => {
  setError("");
  setEditingSubmissionId(undefined);
  setShowNewRequest(true);
};
```

The component is rendered as:

```tsx
<NewRequest
  onClose={handleCloseNewRequest}
  onCreated={handleNewRequestCreated}
/>
```

### API Details

The new request is created through the backend API.

**Method:** POST

**Endpoint:**

```http
POST http://localhost:3000/api/bus/submissions/newrequest
```

### Request Body

The new submission initially requires request information.

```json
{
  "requestInfo": {
    "vehicleType": "BUS",
    "fuelType": "electric",
    "certificationType": "type-approval",
    "unloadedWeightWithoutBattery": "101",
    "category": "L5",
    "preferredTestingAgency": "GARC"
  }
}
```

### Backend Processing

The backend:

1. Validates the authenticated user.
2. Validates the required request information.
3. Creates an empty form structure using configured active fields.
4. Initializes the submission status.
5. Creates a new submission record.
6. Synchronizes the associated tables.
7. Returns the newly created submission and its ID.

The new submission is initially saved with `draft` status when required form fields are still incomplete.

### Example API Response

```json
{
  "success": true,
  "message": "Request created as draft",
  "data": {
    "_id": "6ae55b6db27bad44534dd2db",
    "userId": "6ac904b235db72e9c9367e2c",
    "requestInfo": {
      "vehicleType": "BUS",
      "fuelType": "electric",
      "certificationType": "type-approval",
      "unloadedWeightWithoutBattery": "101",
      "category": "L5",
      "preferredTestingAgency": "GARC"
    },
    "values": {},
    "status": "draft",
    "tables": [
      {
        "id": "6ae55b6d82b1d469cbbc40cb",
        "completionPercentage": 0,
        "status": "not_started"
      },
      {
        "id": "6ae55b6d82b1d469cbbc40cc",
        "completionPercentage": 0,
        "status": "not_started"
      },
      {
        "id": "6ae55b6d82b1d469cbbc40cd",
        "completionPercentage": 0,
        "status": "not_started"
      }
    ]
  }
}
```

The `values` object is shortened here; the actual creation response initializes the configured form fields with empty strings.

### Handling Successful Creation

After successful creation, the `NewRequest` component calls the `onCreated` callback and passes the new submission ID.

The Dashboard handles the callback through:

```typescript
const handleNewRequestCreated = async (submissionId: string) => {
  setError("");
  setShowNewRequest(false);

  await fetchSubmissions();

  setEditingSubmissionId(submissionId);
  setDocumentsRefreshKey((value) => value + 1);

  navigate(`/requests/${submissionId}`);
};
```

The frontend performs the following operations:

1. Closes the new request form.
2. Refreshes the dashboard submission list.
3. Stores the newly created submission ID.
4. Triggers a refresh of the related documents.
5. Navigates to the new submission detail page.

**Navigation example:**

```text
/requests/6ae55b6db27bad44534dd2db
```

## 8. Opening an Existing Submission

**Function:** `handleOpenSubmission()`

Each submission row contains an Open button.

When the user clicks Open, the Dashboard receives the selected submission ID.

```typescript
const handleOpenSubmission = (submissionId: string) => {
  setError("");
  setShowNewRequest(false);
  setEditingSubmissionId(submissionId);
  setDocumentsRefreshKey((value) => value + 1);

  navigate(`/requests/${submissionId}`);
};
```

### Navigation Flow

1. User selects an existing request.
2. The selected submission ID is stored in React state.
3. The document refresh key is incremented.
4. The application navigates to the submission detail page.
5. The detail page retrieves the complete saved submission.

### API Details

**Method:** GET

**Endpoint:**

```http
GET http://localhost:3000/api/bus/submissions/:submissionId
```

**Example:**

```http
GET http://localhost:3000/api/bus/submissions/6ae2ad73b27bad44534dd239
```

The backend retrieves the submission belonging to the authenticated user and returns the full submission document.

The detail page uses the returned `values` object to populate the saved form fields.

The dashboard only needs the submission `_id` for navigation. It does not need to retrieve or store the complete form values in order to open a submission.

## 9. Refreshing the Dashboard

The Dashboard provides a Refresh button to retrieve the latest submission records.

The button calls:

```typescript
onClick={() => void fetchSubmissions()}
```

The refresh process:

1. Checks the authentication token.
2. Sets `submissionsLoading` to `true`.
3. Clears the previous error.
4. Sends a GET request to the submissions endpoint.
5. Processes the API response.
6. Updates the submissions state.
7. Sets `submissionsLoading` to `false`.

The dashboard table is automatically updated when the submissions state changes.

## 10. Loading Related Table Documents

The Dashboard integrates the `TableDocuments` component to display documents associated with the selected submission.

```tsx
{
  editingSubmissionId && (
    <section style={{ marginTop: "32px" }} key={editingSubmissionId}>
      <TableDocuments
        submissionId={editingSubmissionId}
        refreshKey={documentsRefreshKey}
      />
    </section>
  );
}
```

### Props Passed to TableDocuments

| Prop           | Description                                             |
| -------------- | ------------------------------------------------------- |
| `submissionId` | Identifies the selected submission.                     |
| `refreshKey`   | Signals that the related documents should be refreshed. |

Whenever a new submission is created or an existing submission is opened, the refresh key is incremented:

```typescript
setDocumentsRefreshKey((value) => value + 1);
```

This allows the document component to detect that it should refresh its data.

The exact document API endpoints and internal processing are implemented inside `TableDocuments` and are not defined in the Dashboard component.

## 11. Error Handling

The Dashboard handles errors during authentication and API communication.

### Missing Authentication Token

If the token is unavailable, the Dashboard displays:

```text
No stored token was found. Please sign in again.
```

### Authentication Failure

If the backend returns HTTP 401 or 403, the Dashboard displays an authentication error and asks the user to sign in again.

### Invalid JSON Response

If the response cannot be parsed as JSON, the Dashboard displays an invalid response error.

### Empty API Response

If the API returns an empty body with a successful HTTP status, the Dashboard displays:

```text
Empty response body from submissions API.
```

### Failed API Request

For other unsuccessful HTTP responses, the Dashboard displays the backend error message when available, or a fallback error message.

The user can retry the operation using the Try Again button.

## 12. Dashboard API Summary

| Operation                   | Method | Endpoint                             | Purpose                                    |
| --------------------------- | ------ | ------------------------------------ | ------------------------------------------ |
| Retrieve submissions        | GET    | `/api/bus/submissions`               | Retrieve the logged-in user's submissions. |
| Create new submission       | POST   | `/api/bus/submissions/newrequest`    | Create a new vehicle submission.           |
| Retrieve submission details | GET    | `/api/bus/submissions/:submissionId` | Load the complete submission form.         |
| Update submission           | PATCH  | `/api/bus/submissions/:submissionId` | Save changes to an existing submission.    |

All authenticated requests use the Bearer Token in the Authorization header.

## 13. Frontend and Backend Responsibilities

| Functionality                  | Frontend                        | Backend                             |
| ------------------------------ | ------------------------------- | ----------------------------------- |
| Authentication token retrieval | `getStoredToken()`              | Validates authenticated user        |
| Retrieve submissions           | `fetchSubmissions()`            | `getMySubmissions()`                |
| Display submission list        | Dashboard table                 | Returns submission records          |
| Create new request             | `NewRequest`                    | `createSubmission()`                |
| Validate request information   | Displays validation errors      | `validateRequestInfo()`             |
| Initialize form data           | Receives and displays form data | `buildEmptyForm()`                  |
| Open existing request          | `handleOpenSubmission()`        | `getSubmissionById()`               |
| Update saved request           | Form sends PATCH request        | `updateSubmission()`                |
| Refresh dashboard              | Calls `fetchSubmissions()`      | Returns latest submission records   |
| Display table documents        | `TableDocuments`                | Document-related API implementation |

## 14. Recommended Dashboard API Optimization

The dashboard only displays basic submission information. It does not use the complete `values` object.

Therefore, the GET submissions endpoint can return a lightweight response containing:

- `_id`
- `requestInfo`
- `status`
- `createdAt`
- `updatedAt`

Recommended backend query:

```javascript
export const getMySubmissions = async (userId) => {
  validateUser(userId);

  return Submission.find({ userId })
    .select("_id requestInfo status createdAt updatedAt")
    .sort({ createdAt: -1 })
    .lean();
};
```

The detailed GET-by-ID endpoint should continue returning the complete submission, including `values`, because the form page requires that data.

This separates dashboard listing from detailed form loading and avoids transferring unnecessary form data when the user opens the Dashboard.

**Note:** The projection above is a recommended optimization. The currently supplied backend implementation returns full submission documents.

## 15. Complete Dashboard Workflow

The overall Dashboard workflow is:

1. User logs into the application.
2. Authentication token is retrieved from Local Storage.
3. Dashboard loads and calls the GET submissions API.
4. Backend validates the user and retrieves their submissions.
5. Frontend stores the returned records in React state.
6. Dashboard displays request information, status, and timestamps.
7. User can create a new request or open an existing request.
8. When a new request is created, the frontend refreshes the list and navigates to the new submission.
9. When an existing request is opened, the detail page retrieves the full submission data.
10. Related table documents are displayed through the `TableDocuments` component.

The Dashboard acts as the central entry point for managing vehicle submissions, while detailed form data and submission updates are handled by the individual submission pages.

# New Submission Creation and Initial Data Loading Flow

## Purpose

This document explains the complete process for creating a new vehicle submission.

The process includes:

1. Collecting the initial request information.
2. Creating a new submission using the POST API.
3. Generating a new submission ID.
4. Creating the initial form structure with blank values.
5. Creating the related table records.
6. Opening the newly created submission.
7. Loading the newly created submission using the GET API.

---

# 1. Overview of the New Submission Flow

A new submission starts when the user enters the initial vehicle request information.

The initial information includes:

- Vehicle type
- Fuel type
- Certification type
- Unloaded weight without battery
- Category
- Preferred testing agency

The frontend sends this information to the backend to create a new submission.

The overall process is:

```text
User enters initial request information
            ↓
Frontend sends POST request
            ↓
Backend creates a new submission as a draft
            ↓
Backend generates the initial values structure
            ↓
Backend creates related table records
            ↓
Backend returns the new submission ID
            ↓
Frontend opens the new submission
            ↓
GET request loads the newly created submission
            ↓
Form is displayed with blank initial fields
```

---

# 2. Create New Submission API

## Request URL

The frontend creates a new submission using:

```text
POST http://localhost:3000/api/bus/submissions/newrequest
```

The response status is:

```text
201 Created
```

This confirms that a new submission was successfully created.

---

# 3. Actual POST Request Payload

The frontend sends the initial request information:

```json
{
  "requestInfo": {
    "vehicleType": "BUS",
    "fuelType": "electric",
    "certificationType": "type-approval",
    "unloadedWeightWithoutBattery": "101",
    "category": "L5",
    "preferredTestingAgency": "GARC"
  }
}
```

At this stage, the user is only providing the initial request information.

The user is **not sending all form fields and values** in this POST request.

The backend is responsible for creating the initial submission structure.

---

# 4. Backend Creates the Submission

After receiving the POST request, the backend creates a new submission.

The created submission contains:

1. The authenticated user ID.
2. The `requestInfo` provided by the user.
3. The complete initial `values` structure.
4. The initial status as `draft`.
5. A new unique submission ID.
6. Creation and update timestamps.

The actual response shows that the new submission was created with:

```text
Submission ID:
6ae55b6db27bad44534dd2db
```

The submission is associated with:

```text
User ID:
6ac904b235db72e9c9367e2c
```

The initial status is:

```text
draft
```

---

# 5. Actual POST API Response

The API returns:

```json
{
  "success": true,
  "message": "Request created as draft",
  "data": {
    "userId": "6ac904b235db72e9c9367e2c",
    "requestInfo": {
      "vehicleType": "BUS",
      "fuelType": "electric",
      "certificationType": "type-approval",
      "unloadedWeightWithoutBattery": "101",
      "category": "L5",
      "preferredTestingAgency": "GARC"
    },
    "status": "draft",
    "_id": "6ae55b6db27bad44534dd2db"
  }
}
```

The complete response also contains the initial `values` object.

---

# 6. How the Initial Blank Form Values Are Created

One important part of the POST response is:

```text
data.values
```

The backend returns a complete initial values structure.

For example:

```json
{
  "manufacturer": {
    "manufacturerNameAddress": "",
    "manufacturerTelephone": "",
    "manufacturerEmail": "",
    "contactPerson": "",
    "modelName": "",
    "baseFuelType": ""
  }
}
```

The `manufacturer` section already contains all the required fields.

However, because this is a new submission, the fields are initialized with empty values:

```text
""
```

The same process happens for other sections.

For example:

```json
{
  "dimensions": {
    "generalArrangementVehicle": "",
    "typicalVehiclePhotosDrawings": "",
    "completeVehicleDrawing": "",
    "wheelbase": ""
  }
}
```

And:

```json
{
  "identification": {
    "numberSeatingPositions": "",
    "model": "",
    "variant": "",
    "identificationNumber": "",
    "manufacturingDate": "",
    "category": ""
  }
}
```

The complete submission contains all the configured sections, including:

- `manufacturer`
- `dimensions`
- `identification`
- `fuel`
- `tyres`
- `wheel-arrangement`
- `tyre-specification`
- `rolling-radius`
- `inflation-pressure`
- `wheel-rim`
- `weight`
- `engine-specification`
- `transmission-specification`
- `brake-system`
- `suspension-system`
- `electrical-system`

Therefore, immediately after creation, the new submission already has a complete form data structure.

---

# 7. Business Logic for Initial Values

The POST request only sends the initial request information:

```text
requestInfo
```

The backend creates the remaining form structure.

The business logic is:

```text
POST request received
        ↓
Read requestInfo
        ↓
Create a new submission
        ↓
Assign the current authenticated user
        ↓
Create the complete values structure
        ↓
Initialize form fields with blank values
        ↓
Set submission status to "draft"
        ↓
Save the submission
        ↓
Return the new submission ID
```

The result is:

```text
User-provided data:
requestInfo
        +
Backend-generated data:
values with blank fields
        =
New draft submission
```

---

# 8. Related Table Records Are Also Created

The POST response also returns:

```json
{
  "tables": {
    "table1A": {
      "id": "6ae55b6d82b1d469cbbc40cb",
      "completionPercentage": 0,
      "status": "not_started"
    },
    "table11": {
      "id": "6ae55b6d82b1d469cbbc40cc",
      "completionPercentage": 0,
      "status": "not_started"
    },
    "table3A": {
      "id": "6ae55b6d82b1d469cbbc40cd",
      "completionPercentage": 0,
      "status": "not_started"
    }
  }
}
```

This means that, along with the main submission, related table records are also initialized.

Each table starts with:

```text
completionPercentage: 0
status: not_started
```

These table records are associated with the newly created submission and can later track the completion status of the related form/table data.

---

# 9. New Submission Is Opened After Creation

After the POST request successfully creates the submission, the frontend receives the new submission ID:

```text
6ae55b6db27bad44534dd2db
```

The application then opens this newly created submission.

A GET request is made using the new submission ID:

```text
GET http://localhost:3000/api/bus/submissions/6ae55b6db27bad44534dd2db
```

The response status is:

```text
200 OK
```

---

# 10. Why the GET Request Happens After Creation

The POST request creates the submission.

The GET request then loads the newly created submission into the normal submission form flow.

This means the same submission loading process is used for:

- An old existing submission.
- A newly created submission.

The flow is:

```text
POST creates the submission
        ↓
New submission ID is returned
        ↓
Application opens that submission ID
        ↓
GET retrieves the submission
        ↓
loadSubmission() restores data.values into formValues
        ↓
Form is displayed
```

This creates a consistent process for all submissions.

---

# 11. Actual GET Request for the New Submission

After creation, the application calls:

```text
GET http://localhost:3000/api/bus/submissions/6ae55b6db27bad44534dd2db
```

The GET response returns the newly created submission.

The request information remains:

```json
{
  "requestInfo": {
    "vehicleType": "BUS",
    "fuelType": "electric",
    "certificationType": "type-approval",
    "unloadedWeightWithoutBattery": "101",
    "category": "L5",
    "preferredTestingAgency": "GARC"
  }
}
```

The values are still in their initial state:

```json
{
  "manufacturer": {
    "manufacturerNameAddress": "",
    "manufacturerTelephone": "",
    "manufacturerEmail": "",
    "contactPerson": "",
    "modelName": "",
    "baseFuelType": ""
  }
}
```

This is expected because the user has not entered additional form data yet.

---

# 12. How the Newly Created Values Are Loaded Into the Form

The GET response contains:

```text
data.values
```

The frontend uses the existing submission loading process:

```text
loadSubmission()
```

The values are restored into the frontend state:

```js
setFormValues(loadedSubmission.values);
```

Therefore, for the newly created submission:

```text
data.values
        ↓
setFormValues()
        ↓
formValues
        ↓
Form fields
```

Since the new submission contains empty strings, the form fields are displayed as blank.

For example:

```text
manufacturerNameAddress
        ↓
Saved value: ""
        ↓
Displayed as a blank input field
```

---

# 13. Complete New Submission Creation Flow

The complete process is:

```text
┌─────────────────────────────────────┐
│ User enters initial request details │
│                                     │
│ Vehicle Type: BUS                   │
│ Fuel Type: electric                 │
│ Category: L5                        │
│ Testing Agency: GARC                │
└──────────────────┬──────────────────┘
                   │
                   ▼
       POST /api/bus/submissions
                   │
                   ▼
┌─────────────────────────────────────┐
│ Backend creates new submission      │
│                                     │
│ • Assign userId                     │
│ • Save requestInfo                  │
│ • Create blank values structure     │
│ • Set status = draft                │
│ • Create related table records      │
└──────────────────┬──────────────────┘
                   │
                   ▼
        New Submission ID created
                   │
                   ▼
       6ae55b6db27bad44534dd2db
                   │
                   ▼
┌─────────────────────────────────────┐
│ Frontend opens the new submission   │
└──────────────────┬──────────────────┘
                   │
                   ▼
GET /api/bus/submissions/:submissionId
                   │
                   ▼
          loadSubmission()
                   │
                   ▼
 setFormValues(loadedSubmission.values)
                   │
                   ▼
       New blank form is displayed
```

---

# 14. New Submission vs Existing Submission

The application uses two slightly different starting points.

| Scenario            | First API Call                 | Purpose                       |
| ------------------- | ------------------------------ | ----------------------------- |
| New Submission      | `POST /api/bus/submissions`    | Create a new draft submission |
| Existing Submission | `GET /api/bus/submissions/:id` | Load an existing submission   |

After a new submission is created, both flows become the same.

```text
NEW SUBMISSION:

POST
 ↓
Create new submission
 ↓
Get new submission ID
 ↓
GET
 ↓
Load submission
 ↓
Display form


EXISTING SUBMISSION:

GET
 ↓
Load submission
 ↓
Display form
```

---

# 15. Complete Business Logic Summary

## Step 1: User Provides Initial Request Information

The user enters:

```text
Vehicle Type
Fuel Type
Certification Type
Unloaded Weight
Category
Preferred Testing Agency
```

## Step 2: Frontend Creates the Submission

The frontend sends:

```text
POST /api/bus/submissions
```

with the `requestInfo` object.

## Step 3: Backend Creates the Draft

The backend creates:

- A new submission ID.
- The user association.
- The `requestInfo`.
- A complete `values` object with blank fields.
- A `draft` status.
- Related table records.

## Step 4: Backend Returns the New Submission

The response includes:

```text
success: true
message: Request created as draft
data._id: New submission ID
data.values: Initial blank form values
tables: Initial table records
```

## Step 5: Frontend Opens the New Submission

The frontend uses the newly returned submission ID:

```text
6ae55b6db27bad44534dd2db
```

and sends:

```text
GET /api/bus/submissions/6ae55b6db27bad44534dd2db
```

## Step 6: Form Data Is Loaded

The GET response contains the newly created `values` object.

The frontend loads it into:

```text
formValues
```

using:

```js
setFormValues(loadedSubmission.values);
```

## Step 7: User Can Start Entering Data

The user now sees all form fields.

Initially, the fields are blank because the newly created submission contains:

```text
""
```

for most field values.

When the user enters data and saves the form, the current `formValues` are sent through the PATCH API and saved against the same submission ID.

---

# 16. Final Summary

The new submission creation process has two major stages:

### Stage 1: Create

```text
User enters requestInfo
        ↓
POST /api/bus/submissions
        ↓
Backend creates draft submission
        ↓
Backend initializes all form values
        ↓
Backend creates related table records
        ↓
New submission ID is returned
```

### Stage 2: Load

```text
Frontend receives new submission ID
        ↓
GET /api/bus/submissions/:id
        ↓
loadSubmission()
        ↓
setFormValues(data.values)
        ↓
New submission form is displayed
```

## Important Business Rule

> The POST API is responsible for creating the new submission and its initial data structure. After creation, the application uses the submission ID to load the same submission through the standard GET flow. This ensures that a newly created submission and an existing submission use the same form loading process.

The complete lifecycle is:

```text
CREATE
  ↓
GET NEW SUBMISSION
  ↓
LOAD FORM VALUES
  ↓
USER ENTERS DATA
  ↓
PATCH / SAVE DRAFT
  ↓
GET AGAIN WHEN THE SUBMISSION IS REOPENED
  ↓
RESTORE PREVIOUSLY SAVED VALUES
```

# Submission Data Loading, Field Initialization and Saving Flow

## Purpose

This document explains the complete process for:

1. Loading previously saved submission data.
2. Restoring previous values into the form.
3. Loading and handling fields that do not have user-entered values.
4. Saving updated form values back to the same submission.

This process mainly involves the following functions:

- Frontend: `loadSubmission()`
- Frontend: `loadFields()`
- Backend: `getSubmissionById()`
- Backend: Submission update/save function for the PATCH request.

---

# 1. Loading Previously Saved Submission Data

## API Request

When the user opens an existing submission, the frontend uses the submission ID to request the saved data.

### Request

```text
GET http://localhost:3000/api/bus/submissions/6ae2ad73b27bad44534dd239
```

The submission ID is:

```text
6ae2ad73b27bad44534dd239
```

---

## Backend Processing

The backend function responsible for retrieving the submission is:

```text
getSubmissionById()
```

The backend finds the submission from the database using the submission ID and authenticated user ID.

Conceptually, the lookup works as follows:

```js
Submission.findOne({
  _id: submissionId,
  userId: currentUserId,
});
```

This ensures that the correct submission is returned for the authenticated user.

---

# 2. Actual GET API Response

The API returns the saved submission.

The important part for form data is:

```json
{
  "success": true,
  "data": {
    "_id": "6ae2ad73b27bad44534dd239",
    "userId": "6ac904b235db72e9c9367e2c",
    "requestInfo": {
      "vehicleType": "Bus",
      "fuelType": "electric",
      "certificationType": "type-approval"
    },
    "values": {
      "manufacturer": {
        "manufacturerNameAddress": "Acer,Bijapurr",
        "manufacturerTelephone": "",
        "manufacturerEmail": "",
        "contactPerson": "",
        "modelName": "",
        "baseFuelType": ""
      },
      "dimensions": {
        "generalArrangementVehicle": "",
        "typicalVehiclePhotosDrawings": "",
        "completeVehicleDrawing": ""
      },
      "identification": {
        "category": "n1"
      }
    },
    "status": "draft"
  }
}
```

The complete response contains all subcategory values, including `dimensions`, `tyres`, `wheel-arrangement`, `engine-specification`, and other sections.

The key object is:

```text
data.values
```

This object contains the actual values that belong to this submission.

---

# 3. How Previous Values Are Restored

The frontend function responsible for loading the submission is:

```text
loadSubmission()
```

After receiving the GET API response, the frontend extracts:

```js
loadedSubmission.values;
```

Then it stores the values in the form state:

```js
setFormValues(
  loadedSubmission.values && typeof loadedSubmission.values === "object"
    ? loadedSubmission.values
    : {},
);
```

## Actual Example

From the GET response:

```json
{
  "manufacturer": {
    "manufacturerNameAddress": "Acer,Bijapurr",
    "manufacturerTelephone": "",
    "manufacturerEmail": "",
    "contactPerson": "",
    "modelName": "",
    "baseFuelType": ""
  }
}
```

This data is stored in:

```text
formValues
```

Therefore, the form state contains:

```js
formValues.manufacturer.manufacturerNameAddress;
```

with the value:

```text
Acer,Bijapurr
```

When the corresponding input field is rendered, it reads its value from `formValues`. Therefore, the user sees the previously saved value in the form.

## Previous Data Loading Flow

```text
User opens submission
        ↓
loadSubmission() is called
        ↓
GET /api/bus/submissions/6ae2ad73b27bad44534dd239
        ↓
Backend getSubmissionById() finds the submission
        ↓
Backend returns data.values
        ↓
Frontend calls setFormValues(loadedSubmission.values)
        ↓
Previously saved values are restored in formValues
        ↓
Form displays the previous values
```

---

# 4. What Happens to Blank Fields?

The actual GET response already contains many fields with empty values.

For example:

```json
{
  "manufacturer": {
    "manufacturerNameAddress": "Acer,Bijapurr",
    "manufacturerTelephone": "",
    "manufacturerEmail": "",
    "contactPerson": "",
    "modelName": "",
    "baseFuelType": ""
  }
}
```

This means:

| Field                     | Saved Value       | Form Result              |
| ------------------------- | ----------------- | ------------------------ |
| `manufacturerNameAddress` | `"Acer,Bijapurr"` | Displays `Acer,Bijapurr` |
| `manufacturerTelephone`   | `""`              | Displays as blank        |
| `manufacturerEmail`       | `""`              | Displays as blank        |
| `contactPerson`           | `""`              | Displays as blank        |
| `modelName`               | `""`              | Displays as blank        |
| `baseFuelType`            | `""`              | Displays as blank        |

Therefore, **a blank field can come directly from the saved `values` object**.

An empty string:

```js
"";
```

means the field exists in the submission but the user has not entered a value.

---

# 5. What If a Field Does Not Exist in the Saved Submission?

This is where the second frontend function is important.

## Function: `loadFields()`

The `loadFields()` function loads the current field definitions for the selected subcategory.

For example, the field configuration may define these fields:

```text
manufacturerNameAddress
manufacturerTelephone
manufacturerEmail
contactPerson
modelName
baseFuelType
```

After loading the field definitions, the application checks whether every configured field already exists in `formValues`.

The business logic is:

```text
For every field definition:
    ↓
Does this field already exist in formValues?
    ↓
YES → Keep the existing value
NO  → Create a default blank value
```

Conceptually:

```js
fetchedFields.forEach((field) => {
  if (!fieldAlreadyExists) {
    updatedValues[field.name] = field.type === "checkbox" ? false : "";
  }
});
```

---

# 6. Two Different Sources for Form Values

There are two possible sources for the values displayed in the form.

## Source 1: Previously Saved Submission Values

These come from:

```text
GET /api/bus/submissions/:submissionId
```

Example:

```json
"manufacturerNameAddress": "Acer,Bijapurr"
```

This value is preserved and displayed.

---

## Source 2: Default Values for Missing Fields

If a field exists in the field configuration but does not exist in the saved submission data, `loadFields()` creates a default value.

For normal fields:

```js
"";
```

For checkbox fields:

```js
false;
```

---

# 7. Complete Field Value Decision Process

For every field, the application follows this logic:

```text
Load saved submission values
        ↓
Load field definitions
        ↓
Check each field
        │
        ├── Field already exists in saved values?
        │          │
        │         YES
        │          ↓
        │    Keep existing value
        │
        └── NO
                   ↓
          Create default value
          "" for normal fields
          false for checkboxes
                   ↓
             Final formValues
                   ↓
             Display the form
```

---

# 8. Actual Update and Save Process

In the current example, the user changed the manufacturer address from:

```text
Acer,Bijapurr
```

to:

```text
Acer,Sindagi ,Bijapur
```

The frontend sends a PATCH request to the same submission:

```text
PATCH http://localhost:3000/api/bus/submissions/6ae2ad73b27bad44534dd239
```

---

## Actual PATCH Request Payload

The request contains the current `formValues` object.

The important changed section is:

```json
{
  "values": {
    "manufacturer": {
      "manufacturerNameAddress": "Acer,Sindagi ,Bijapur",
      "manufacturerTelephone": "",
      "manufacturerEmail": "",
      "contactPerson": "",
      "modelName": "",
      "baseFuelType": ""
    }
  }
}
```

The actual request also includes all other sections such as:

- `dimensions`
- `identification`
- `fuel`
- `tyres`
- `wheel-arrangement`
- `tyre-specification`
- `rolling-radius`
- `inflation-pressure`
- `wheel-rim`
- `weight`
- `engine-specification`
- `transmission-specification`
- `brake-system`
- `suspension-system`
- `electrical-system`

This means the frontend sends the complete current form state as:

```text
formValues
        ↓
PATCH request
        ↓
Backend saves/updates the submission
```

---

# 9. Actual PATCH Response

The API returns:

```json
{
  "success": true,
  "message": "Request saved as draft",
  "data": {
    "_id": "6ae2ad73b27bad44534dd239",
    "values": {
      "manufacturer": {
        "manufacturerNameAddress": "Acer,Sindagi ,Bijapur"
      }
    },
    "updatedAt": "2026-10-31T02:58:18.368Z"
  }
}
```

This confirms that the value was saved successfully.

The submission ID remains the same:

```text
6ae2ad73b27bad44534dd239
```

The updated value is:

```text
Acer,Sindagi ,Bijapur
```

---

# 10. Complete End-to-End Flow

## First Time the Submission Is Opened

```text
GET /api/bus/submissions/6ae2ad73b27bad44534dd239
        ↓
Backend returns the saved submission
        ↓
Frontend receives data.values
        ↓
loadSubmission() calls setFormValues()
        ↓
Existing values are restored
```

### Example

```text
manufacturerNameAddress
        ↓
"Acer,Bijapurr"
        ↓
Displayed in the form
```

---

## Fields Without a Value

```text
loadFields() loads field definitions
        ↓
Check whether each field exists in formValues
        ↓
Existing field → Keep its value
Missing field → Initialize with "" or false
        ↓
Display the complete form
```

---

## User Changes a Value

```text
User changes:
"Acer,Bijapurr"

to:

"Acer,Sindagi ,Bijapur"
        ↓
formValues is updated
        ↓
User clicks Save
        ↓
PATCH /api/bus/submissions/6ae2ad73b27bad44534dd239
        ↓
Current formValues is sent to the backend
        ↓
Backend updates the submission
        ↓
Response confirms the draft was saved
```

---

# 11. Final Business Logic Summary

There are two main processes working together.

## Process 1: `loadSubmission()`

Responsible for restoring previously saved user data.

```text
Database
    ↓
GET Submission API
    ↓
data.values
    ↓
setFormValues()
    ↓
Previous values displayed in the form
```

## Process 2: `loadFields()`

Responsible for ensuring all configured fields have a value in the form state.

```text
Field definitions
    ↓
Check against existing formValues
    ↓
Existing value → Preserve it
Missing value → Create "" or false
    ↓
Complete form state
```

## Important Rule

> Saved values always take priority. Field initialization should only add missing fields and must not overwrite previously saved user values.

In the current real example:

```text
GET API returns:
manufacturerNameAddress = "Acer,Bijapurr"

User changes it to:
manufacturerNameAddress = "Acer,Sindagi ,Bijapur"

PATCH API saves the updated value.

When the same submission is opened again, the GET API returns the latest saved value, and `loadSubmission()` restores that value into the form.
```

# Vehicle Submission – Validation, Completion and Table Synchronization

## 1. Overview

The backend manages the vehicle submission form using three main processes:

1. Request information and form field validation.
2. Submission creation and update.
3. Synchronization of submission values into separate table collections.

The main configuration source for vehicle form fields is `fields.json`.

Only active fields (`isActive: true`) are included in form initialization, value merging, validation and table synchronization.

## 2. Request Information Validation

Before creating a submission, the backend validates the following required request information:

| Field                          | Description                   |
| ------------------------------ | ----------------------------- |
| `vehicleType`                  | Type of Vehicle               |
| `fuelType`                     | Fuel Type                     |
| `certificationType`            | Type of Certification         |
| `unloadedWeightWithoutBattery` | Unloaded Weight (w/o Battery) |
| `category`                     | Category                      |
| `preferredTestingAgency`       | Preferred Testing Agency      |

If any required field is missing or empty, the backend returns a validation error.

Expected error status: `400 Bad Request`.

## 3. Vehicle Form Initialization

The `buildEmptyForm()` function creates the initial vehicle form values.

It:

- Reads the configured fields from `fields.json`.
- Skips inactive fields.
- Groups fields by `subCategoryId`.
- Initializes each active field with an empty string.

Example:

    {
      "manufacturer": {
        "manufacturerNameAddress": "",
        "manufacturerTelephone": "",
        "manufacturerEmail": ""
      },
      "dimensions": {
        "generalArrangementVehicle": "",
        "typicalVehiclePhotosDrawings": ""
      }
    }

If initial values are provided, `mergeFormValues()` applies only recognized active fields to this structure.

## 4. Vehicle Form Validation

The `validateValue()` function validates individual fields based on their configuration.

Supported validation types:

| Field type / rule | Validation                                           |
| ----------------- | ---------------------------------------------------- |
| Required          | Checks whether a required value is present           |
| Number            | Checks whether the value is numeric                  |
| Number minimum    | Checks the configured minimum                        |
| Number maximum    | Checks the configured maximum                        |
| Date              | Checks whether the value is a valid date             |
| Dropdown          | Checks whether the value matches an available option |
| Radio             | Checks whether the value matches an available option |
| Checkbox          | Checks whether the value is Boolean                  |
| Minimum length    | Checks the configured minimum string length          |
| Maximum length    | Checks the configured maximum string length          |
| Pattern           | Checks the configured regular expression             |

### Draft validation behaviour

Empty fields are allowed during draft creation and updating.

However, any supplied non-empty value must pass its configured validation rules.

Validation errors are grouped by subcategory and field name.

Example structure:

    {
      "dimensions": {
        "overallLength": [
          "Overall Length must be a number"
        ]
      }
    }

## 5. Required Field Completion Check

The `hasAllRequiredFieldsInForm()` function checks all active fields marked as required in `fields.json`.

If every required field has a value, the submission is marked as `completed`.

Otherwise, it remains `draft`.

Important: In the current service implementation, `completed` is determined automatically from required-field completion. This is not evidence of a separate final submission or approval workflow.

## 6. Table Synchronization

The application maintains three separate MongoDB table collections.

| Table ID  | Mongoose model |
| --------- | -------------- |
| `table1A` | `Table1A`      |
| `table11` | `Table11`      |
| `table3A` | `Table3A`      |

The `syncSubmissionTables()` function synchronizes all three tables.

### How table data is prepared

The `getTableFields()` function selects active fields whose `tables` configuration includes the relevant table ID.

The `buildTableData()` function:

- Reads each field's `subCategoryId`.
- Reads its field name.
- Gets the corresponding value from the submission.
- Places the value in the table's data structure.
- Uses an empty string when the value is missing or null.

A field can belong to multiple tables if its configuration lists multiple table IDs.

### Table completion percentage

The `calculateTableCompletion()` function calculates:

    Completion Percentage =
    (Number of filled table fields / Total active table fields) * 100

The result is rounded to the nearest whole number.

All active fields assigned to the table are counted, including optional fields.

### Table status

| Completion percentage | Table status  |
| --------------------: | ------------- |
|                    0% | `not_started` |
|    Between 1% and 99% | `in_progress` |
|                  100% | `completed`   |

### Create or update table records

The `syncOneTable()` function uses:

    Model.findOneAndUpdate(
      { submissionId },
      {
        $set: {
          submissionId,
          userId,
          data,
          completionPercentage,
          status
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    )

This creates a table document if one does not exist, or updates the existing document for that submission.

The synchronization is performed for `table1A`, `table11` and `table3A`.

## 7. Submission Creation Flow

The `createSubmission()` service performs these steps:

1. Validates the authenticated user.
2. Validates the six required request information fields.
3. Reads optional incoming vehicle form values.
4. Builds the complete initial form using active field definitions.
5. Merges any supplied values.
6. Validates supplied non-empty form values.
7. Checks whether all required fields are filled.
8. Creates the main submission document.
9. Sets the status to `completed` or `draft`.
10. Synchronizes all three table collections.
11. Returns the submission, completion result and table information.

## 8. Submission Update Flow

The `updateSubmission()` service performs these steps:

1. Validates the authenticated user.
2. Finds the submission using both submission ID and user ID.
3. Updates request information if supplied.
4. Rebuilds the complete active form structure if vehicle values are supplied.
5. Restores previously saved values.
6. Merges incoming values.
7. Validates the resulting form.
8. Determines whether all required fields are completed.
9. Updates the submission status.
10. Saves the main submission document.
11. Synchronizes the three table collections.
12. Returns the updated submission, completion result and table information.

An explicitly supplied empty string clears the saved value of that field.

Fields not included in the incoming values are preserved from the existing submission, provided they remain active in `fields.json`.

Unknown and inactive fields are not copied into the rebuilt form.

## 9. Submission Retrieval

### Get all submissions for the logged-in user

The `getMySubmissions()` service:

- Validates the user.
- Retrieves submissions belonging to that user.
- Sorts the results by creation date in descending order.

### Get one submission

The `getSubmissionById()` service:

- Validates the user.
- Requires a submission ID.
- Retrieves the submission using both `_id` and `userId`.
- Returns a not-found error if no matching submission exists.

This prevents a user from retrieving another user's submission through this service.

## 10. Important Implementation Notes

- The main submission and the three table records are stored separately.
- Table records are synchronized after the main submission is created or updated.
- Table synchronization uses the current active field configuration.
- Table completion is based on all active fields assigned to that table, not only required fields.
- Submission completion and table completion are separate calculations.
- The current service code does not show a separate `submitted`, `under_review` or `approved` transition.
- The current code does not show a MongoDB transaction wrapping the main submission save and table synchronization. If synchronization fails after the main document is saved, the two parts may temporarily be inconsistent.

## 11. Main Service Responsibilities

| Function                       | Responsibility                           |
| ------------------------------ | ---------------------------------------- |
| `validateRequestInfo()`        | Validates initial request information    |
| `buildEmptyForm()`             | Creates empty values for active fields   |
| `mergeFormValues()`            | Merges recognized field values           |
| `validateCompleteForm()`       | Validates supplied non-empty values      |
| `hasAllRequiredFieldsInForm()` | Checks required field completion         |
| `createSubmission()`           | Creates a new submission                 |
| `updateSubmission()`           | Updates an existing submission           |
| `getMySubmissions()`           | Retrieves the user's submissions         |
| `getSubmissionById()`          | Retrieves one user's submission          |
| `syncSubmissionTables()`       | Synchronizes all three table collections |
| `syncSingleTable()`            | Synchronizes one specified table         |
| `calculateTableCompletion()`   | Calculates table completion percentage   |
| `getTableStatus()`             | Determines table status                  |
