import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import type { UserType } from "../types";

interface Loan {
  id: number;
  project_id: number;
  lender_id: number;
  amount: number;
  repaid: boolean;
}

interface LoansProps {
  user?: UserType | null;
}

const Loans: React.FC<LoansProps> = ({ user }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchLoans = async () => {
      try {
        const res = await fetch(`http://localhost:5000/get_loans/${user.id}`);
        const data = await res.json();
        setLoans(data.loans || []);
      } catch (err) {
        console.error("Failed to fetch loans", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [user]);

  const handleRepay = async (loanId: number, amount: number) => {
  setMessage("");
  try {
    const res = await fetch("http://localhost:5000/repay_loan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ loan_id: loanId, amount }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`Loan ${loanId} marked as repaid! Block hash: ${data.tx_hash}`);
      setLoans((prev) =>
        prev.map((loan) => (loan.id === loanId ? { ...loan, repaid: true } : loan))
      );
    } else {
      setMessage(`Error: ${data.message || "Something went wrong"}`);
    }
  } catch (err) {
    setMessage("Failed to connect to backend.");
  }
};


  if (!user) {
    return (
      <p className="text-center mt-10 text-red-600 font-semibold">
        You must be logged in to view loans.
      </p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-6">
      <h1 className="text-4xl font-extrabold text-gradient bg-clip-text text-transparent mb-6">
        My Loans
      </h1>

      {message && (
        <p className="mb-4 text-center text-lg font-semibold text-blue-600 animate-pulse">
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-center text-gray-500">Loading loans...</p>
      ) : loans.length === 0 ? (
        <p className="text-center text-gray-500 font-medium">No loans found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map((loan) => (
            <Card
              key={loan.id}
              className="shadow-xl rounded-3xl hover:scale-105 transform transition-all duration-300 bg-gradient-to-r from-purple-50 to-pink-50"
            >
              <CardContent className="space-y-3">
                <h2 className="text-2xl font-bold text-purple-700">
                  Loan #{loan.id}
                </h2>
                <p className="text-gray-600">
                  <span className="font-semibold">Project ID:</span> {loan.project_id}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Lender ID:</span> {loan.lender_id}
                </p>
                <p className="text-gray-800 font-semibold">
                  Amount: <span className="text-green-600">{loan.amount} ETH</span>
                </p>
                <p className="flex items-center gap-2 font-semibold">
                  Status:{" "}
                  {loan.repaid ? (
                    <FaCheckCircle className="text-green-600 text-lg" />
                  ) : (
                    <FaTimesCircle className="text-red-600 text-lg" />
                  )}
                  <span className={loan.repaid ? "text-green-600" : "text-red-600"}>
                    {loan.repaid ? "Repaid" : "Pending"}
                  </span>
                </p>

                {!loan.repaid && (
                 <Button
  onClick={() => handleRepay(loan.id, loan.amount)}
  className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-pink-500 hover:to-purple-600 text-white font-bold transition-all duration-300"
>
  Mark as Repaid
</Button>

                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Loans;
