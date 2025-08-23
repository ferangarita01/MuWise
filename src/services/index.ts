import { AgreementService } from './agreementService';
import { UserService } from './userService';
import { EmailService } from './emailService';

// Singleton pattern para servicios
class ServiceContainer {
  private static instances: Map<string, any> = new Map();
  
  static getAgreementService(): AgreementService {
    if (!this.instances.has('agreement')) {
      this.instances.set('agreement', new AgreementService());
    }
    return this.instances.get('agreement');
  }
  
  static getUserService(): UserService {
    if (!this.instances.has('user')) {
      this.instances.set('user', new UserService());
    }
    return this.instances.get('user');
  }
  
  static getEmailService(): EmailService {
    if (!this.instances.has('email')) {
      this.instances.set('email', new EmailService());
    }
    return this.instances.get('email');
  }
  
  // Limpiar instancias (útil para testing)
  static clear(): void {
    this.instances.clear();
  }
}

export { ServiceContainer };
export * from './agreementService';
export * from './userService';
export * from './emailService';