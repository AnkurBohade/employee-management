import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../employee.service';
import * as bootstrap from 'bootstrap'; 
import Swal from 'sweetalert2';  
import jsPDF from 'jspdf';  
import html2canvas from 'html2canvas';  
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  
  onPhotoUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.employeeForm.employeePhoto = reader.result; // Preview image
      };
      this.employeePhoto = file; // Store the file for submission
    }
  }
  
  employees: any[] = [];
  employeeForm: any = {}; // To store employee data when editing or adding
  selectedEmployeeId: string | null = null; // Track employee ID for editing
  employeePhoto: any;  // To store employee photo file

  constructor(private employeeService: EmployeeService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe((data: any) => {
      this.employees = data.map((employee: any) => {
        if (employee.employeePhoto) {
          employee.employeePhoto = `http://localhost:5000${employee.employeePhoto}`;
        }
        return employee;
      });
    });
  }

  openEmployeeModal(employee: any = null) {
    if (employee) {
      this.selectedEmployeeId = employee._id;
      this.employeeForm = { ...employee };
  
      // Ensure DOB is in YYYY-MM-DD format for the input field
      if (employee.dob) {
        this.employeeForm.dob = this.datePipe.transform(employee.dob, 'yyyy-MM-dd');
      }
    } else {
      this.selectedEmployeeId = null;
      this.employeeForm = {};
    }
  
    const modalElement = document.getElementById('employeeModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
      });
      modal.show();
    }
  }
  

  openGenerateIDModal(employee: any) {
    this.employeeForm = { ...employee };
    const modalElement = document.getElementById('generateIDModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  generateIDCard(format: string) {
    const content = document.getElementById('employeeIDCard');
    
    if (content) {
      if (format === 'pdf') {
        const doc = new jsPDF();
        doc.html(content, {
          callback: (doc) => {
            doc.save('employee-id-card.pdf');
          }
        });
      } else {
        html2canvas(content).then((canvas) => {
          const imgData = canvas.toDataURL(`image/${format}`);
          const link = document.createElement('a');
          link.href = imgData;
          link.download = `employee-id-card.${format}`;
          link.click();
        });
      }
    }
  }
  saveEmployee() {
    const formData = new FormData();
    formData.append('employeeName', this.employeeForm.employeeName);
    formData.append('designation', this.employeeForm.designation);
    formData.append('email', this.employeeForm.email);
    formData.append('dob', this.employeeForm.dob);
    formData.append('mobile', this.employeeForm.mobile);
    formData.append('address', this.employeeForm.address);
    formData.append('bloodGroup', this.employeeForm.bloodGroup);
  
    if (this.employeePhoto) {
      formData.append('employeePhoto', this.employeePhoto);
    }
  
    if (this.selectedEmployeeId) {
      this.employeeService.updateEmployee(this.selectedEmployeeId, formData).subscribe(() => {
        Swal.fire('Success', 'Employee updated successfully', 'success');
        this.loadEmployees();
      });
    } else {
      this.employeeService.addEmployee(formData).subscribe(() => {
        Swal.fire('Success', 'Employee added successfully', 'success');
        this.loadEmployees();
      });
    }
  }
  
  deleteEmployee(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.employeeService.deleteEmployee(id).subscribe(() => {
          Swal.fire('Deleted!', 'Employee has been deleted.', 'success');
          this.loadEmployees();
        });
      }
    });
  }

  closeModal() {
    const modalElement = document.getElementById('employeeModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.hide();
    }
  }
}
