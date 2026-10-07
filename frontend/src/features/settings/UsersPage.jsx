import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

import { Badge, Button, Card, ConfirmDialog, EmptyState, PageHeader, Pagination, SearchInput, Table } from '@/components/ui';
import { ROLE_LABELS } from '@/constants/roles';
import { useAuth } from '@/context/AuthContext';
import { useListParams } from '@/hooks/useListParams';
import { useDeleteUser, useUsers } from '@/hooks/useUsers';
import { formatDate } from '@/utils/format';

import UserFormModal from './UserFormModal';

export default function UsersPage() {
  const { search, setSearch, page, setPage, params } = useListParams();
  const { data, isLoading } = useUsers(params);
  const { user: currentUser } = useAuth();
  const deleteUser = useDeleteUser();
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const columns = [
    { key: 'name', header: 'Name', render: (u) => <span className="font-medium">{u.name}</span> },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (u) => <Badge tone="primary">{ROLE_LABELS[u.role]}</Badge> },
    {
      key: 'is_active',
      header: 'Status',
      render: (u) => <Badge tone={u.is_active ? 'success' : 'neutral'}>{u.is_active ? 'Active' : 'Disabled'}</Badge>,
    },
    { key: 'created_at', header: 'Created', render: (u) => formatDate(u.created_at) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (u) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditing(u)} aria-label={`Edit ${u.name}`} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
          {u.id !== currentUser.id && (
            <Button variant="ghost" size="icon" onClick={() => setToDelete(u)} aria-label={`Delete ${u.name}`} title="Delete">
              <Trash2 className="h-4 w-4 text-danger-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Users"
        description="Who can sign in, and what they can do."
        actions={
          <Button icon={Plus} onClick={() => setEditing({})}>
            New user
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <div className="border-b border-border-200 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search name or email" />
        </div>
        <Table columns={columns} data={data?.items} isLoading={isLoading} empty={<EmptyState icon={Users} title="No users found" />} />
        <Pagination page={page} pageSize={params.page_size} total={data?.total} onPageChange={setPage} />
      </Card>
      <UserFormModal open={editing !== null} onClose={() => setEditing(null)} user={editing?.id ? editing : null} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Delete user"
        message={`Permanently delete ${toDelete?.name}? Users who have created orders or other records can't be deleted — disable them from Edit instead.`}
        confirmLabel="Delete user"
        loading={deleteUser.isPending}
        onConfirm={() => deleteUser.mutate(toDelete.id, { onSettled: () => setToDelete(null) })}
      />
    </>
  );
}
