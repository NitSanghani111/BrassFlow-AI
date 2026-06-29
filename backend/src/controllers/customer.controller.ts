import { Request, Response, NextFunction } from 'express';
import { CustomerRepository } from '../repositories/customer.repository';
import { logger } from '../utils/logger';

const customerRepository = new CustomerRepository();

export class CustomerController {
  async getAllCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching all customers');
      const customers = await customerRepository.findMany();
      res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (error: any) {
      logger.error(`Failed to fetch customers: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching customers',
      });
    }
  }

  async getCustomerById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Fetching customer by ID: ${id}`);
      const customer = await customerRepository.findById(id);

      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error: any) {
      logger.error(`Failed to fetch customer: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching customer details',
      });
    }
  }

  async createCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info(`Creating customer: ${req.body.companyName}`);
      const customer = await customerRepository.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: customer,
      });
    } catch (error: any) {
      logger.error(`Failed to create customer: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error while creating customer',
      });
    }
  }

  async updateCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Updating customer: ${id}`);
      
      const existing = await customerRepository.findById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
        return;
      }

      const updated = await customerRepository.update(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Customer updated successfully',
        data: updated,
      });
    } catch (error: any) {
      logger.error(`Failed to update customer: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error while updating customer',
      });
    }
  }

  async deleteCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      logger.info(`Deleting customer: ${id}`);

      const existing = await customerRepository.findById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
        return;
      }

      await customerRepository.delete(id);
      res.status(200).json({
        success: true,
        message: 'Customer deleted successfully (soft-deleted)',
      });
    } catch (error: any) {
      logger.error(`Failed to delete customer: ${error.message}`);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting customer',
      });
    }
  }
}
