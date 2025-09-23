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
    // User Registration
    // ------------------------------
    mapping(address => string) public users;
    event UserRegistered(address userAddress, string name);

    function registerUser(address _user, string memory _name) public {
        require(bytes(users[_user]).length == 0, "User already registered");
        users[_user] = _name;
        emit UserRegistered(_user, _name);
    }

    // ------------------------------
    // Events
    // ------------------------------
    event ProjectCreated(uint projectId, address borrower, string name);
    event FundAdded(uint projectId, uint amount);
    event MilestoneApproved(uint projectId, uint milestoneIndex, uint amountReleased);

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
}
