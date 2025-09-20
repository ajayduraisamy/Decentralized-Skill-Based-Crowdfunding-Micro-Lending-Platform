# training.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib

# -------------------------------
# Load Dataset
# -------------------------------
df = pd.read_csv("borrower_data.csv")

# Features and target
X = df[["num_projects", "avg_milestone_completion", "skill_score", "gpa", "repayment_rate"]]
y = df["label"]

# Split into train/test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# -------------------------------
# Train Random Forest Classifier
# -------------------------------
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# -------------------------------
# Evaluate Model
# -------------------------------
y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# -------------------------------
# Save Model
# -------------------------------
joblib.dump(model, "trust_score_model.pkl")
print("Model saved as trust_score_model.pkl")
