# gui_test.py
import tkinter as tk
from tkinter import messagebox
import pandas as pd
import joblib

# Load trained model
model = joblib.load("trust_score_model.pkl")

# Function to predict trust score
def predict_trust():
    try:
        # Get input values
        num_projects = int(entry_projects.get())
        milestone_completion = float(entry_milestone.get())
        skill_score = int(entry_skill.get())
        gpa = float(entry_gpa.get())
        repayment_rate = float(entry_repay.get())
        
        # Prepare DataFrame
        input_df = pd.DataFrame([{
            "num_projects": num_projects,
            "avg_milestone_completion": milestone_completion,
            "skill_score": skill_score,
            "gpa": gpa,
            "repayment_rate": repayment_rate
        }])
        
        # Predict
        label = model.predict(input_df)[0]
        probability = model.predict_proba(input_df)[0][1]  # probability for label 1 (reliable)
        
        result = f"Predicted label: {label}\nTrust Score (0-100): {int(probability*100)}"
        messagebox.showinfo("Result", result)
    except Exception as e:
        messagebox.showerror("Error", f"Invalid input: {e}")

# Create GUI window
root = tk.Tk()
root.title("Borrower Trust Score Prediction")

# Labels and entry fields
tk.Label(root, text="Number of Projects").grid(row=0, column=0)
entry_projects = tk.Entry(root)
entry_projects.grid(row=0, column=1)

tk.Label(root, text="Average Milestone Completion (0-1)").grid(row=1, column=0)
entry_milestone = tk.Entry(root)
entry_milestone.grid(row=1, column=1)

tk.Label(root, text="Skill Score (0-100)").grid(row=2, column=0)
entry_skill = tk.Entry(root)
entry_skill.grid(row=2, column=1)

tk.Label(root, text="GPA (0-10)").grid(row=3, column=0)
entry_gpa = tk.Entry(root)
entry_gpa.grid(row=3, column=1)

tk.Label(root, text="Repayment Rate (0-1)").grid(row=4, column=0)
entry_repay = tk.Entry(root)
entry_repay.grid(row=4, column=1)

# Predict button
tk.Button(root, text="Predict Trust Score", command=predict_trust).grid(row=5, column=0, columnspan=2, pady=10)

# Run the GUI
root.mainloop()
