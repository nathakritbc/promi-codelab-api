import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import type {
  UserCreatedAt,
  UserEmail,
  UserId,
  UserPassword,
  UserUpdatedAt,
} from '../../applications/domains/user.domain';

export const usersTableName = 'users';

@Entity({
  name: usersTableName,
})
export class UserEntity {
  @PrimaryColumn({
    type: 'uuid',
  })
  uuid: UserId;

  @Column({
    type: 'varchar',
    unique: true,
  })
  email: UserEmail;

  @Column({
    type: 'text',
  })
  password: UserPassword;

  @CreateDateColumn()
  declare createdAt: UserCreatedAt;

  @UpdateDateColumn()
  declare updatedAt: UserUpdatedAt;
}
