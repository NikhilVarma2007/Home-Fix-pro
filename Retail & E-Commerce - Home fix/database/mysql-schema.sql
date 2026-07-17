create database if not exists homefix
  character set utf8mb4
  collate utf8mb4_unicode_ci;

use homefix;

create table if not exists app_state (
  id varchar(64) primary key,
  data json not null,
  created_at timestamp(6) not null default current_timestamp(6),
  updated_at timestamp(6) not null default current_timestamp(6) on update current_timestamp(6)
);
