// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MicroLendingPlatform {

    // ------------------------------
    // Project & Milestone Structures
    // ------------------------------
    struct Project {
        address borrower;
        string name;
        uint totalFunded;
        uint currentMilestone;
        bool exists;
    }

    struct Milestone {
        string description;
        uint fundAmount;
        bool approved;
    }

    mapping(uint => Project) public projects;
    mapping(uint => Milestone[]) public projectMilestones;
    uint public projectCount;

    // ------------------------------
    // Loan Structures
    // ------------------------------
    struct Loan {
        uint projectId;          // optional: tie loan to a project
        address borrower;
        address lender;
        uint principal;
        uint remaining;
        uint interest;
        bool repaid;
    }

    mapping(uint => Loan) public loans;
    uint public loanCount;

    // ------------------------------
    // Events
    // ------------------------------
    event ProjectCreated(uint projectId, address borrower, string name);
    event FundAdded(uint projectId, uint amount);
    event MilestoneApproved(uint projectId, uint milestoneIndex, uint amountReleased);
    event LoanCreated(uint loanId, uint projectId, address borrower, address lender, uint principal, uint interest);
    event LoanRepaid(uint loanId, uint amount, bool fullyRepaid);

    // ------------------------------
    // Project Functions
    // ------------------------------
    function createProject(string memory _name) public {
        projectCount++;
        projects[projectCount] = Project(msg.sender, _name, 0, 0, true);
        emit ProjectCreated(projectCount, msg.sender, _name);
    }

    function addMilestone(uint _projectId, string memory _desc, uint _fundAmount) public {
        Project storage project = projects[_projectId];
        require(project.borrower == msg.sender, "Only borrower can add milestones");
        projectMilestones[_projectId].push(Milestone(_desc, _fundAmount, false));
    }

    function fundProject(uint _projectId) public payable {
        Project storage project = projects[_projectId];
        require(project.exists, "Project does not exist");
        project.totalFunded += msg.value;
        emit FundAdded(_projectId, msg.value);
    }

    function approveMilestone(uint _projectId, uint _milestoneIndex) public {
        Project storage project = projects[_projectId];
        Milestone storage milestone = projectMilestones[_projectId][_milestoneIndex];
        require(msg.sender == project.borrower, "Only borrower can request approval"); 
        require(!milestone.approved, "Already approved");

        milestone.approved = true;
        payable(project.borrower).transfer(milestone.fundAmount);
        project.currentMilestone++;
        emit MilestoneApproved(_projectId, _milestoneIndex, milestone.fundAmount);
    }

    function getMilestones(uint _projectId) public view returns (Milestone[] memory) {
        return projectMilestones[_projectId];
    }

    // ------------------------------
    // Peer-to-Peer Loan Functions
    // ------------------------------

    // Lender creates a loan for a borrower, optionally tied to a project
    function createLoan(uint _projectId, address _borrower, uint _interest) public payable {
        require(msg.value > 0, "Principal must be greater than 0");
        loanCount++;
        loans[loanCount] = Loan({
            projectId: _projectId,
            borrower: _borrower,
            lender: msg.sender,
            principal: msg.value,
            remaining: msg.value + _interest,
            interest: _interest,
            repaid: false
        });

        emit LoanCreated(loanCount, _projectId, _borrower, msg.sender, msg.value, _interest);
    }

    // Borrower repays the loan
    function repayLoan(uint _loanId) public payable {
        Loan storage loan = loans[_loanId];
        require(msg.sender == loan.borrower, "Only borrower can repay");
        require(msg.value <= loan.remaining, "Overpayment not allowed");
        require(!loan.repaid, "Loan already repaid");

        loan.remaining -= msg.value;
        payable(loan.lender).transfer(msg.value);

        if (loan.remaining == 0) {
            loan.repaid = true;
        }

        emit LoanRepaid(_loanId, msg.value, loan.repaid);
    }

    // ------------------------------
    // Helper Functions
    // ------------------------------
    function getLoan(uint _loanId) public view returns (
        uint projectId,
        address borrower,
        address lender,
        uint principal,
        uint remaining,
        uint interest,
        bool repaid
    ) {
        Loan storage loan = loans[_loanId];
        return (
            loan.projectId,
            loan.borrower,
            loan.lender,
            loan.principal,
            loan.remaining,
            loan.interest,
            loan.repaid
        );
    }
}
