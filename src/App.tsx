import { useState, useEffect } from "react";

type Status = 'To Do' | 'In Progress' | 'Done';

interface Task {
  id: string;
  title: string;
  deadline: string;
  status: Status;
}

const STATUSES: Status[] = ['To Do', 'In Progress', 'Done'];

const nextStatus: Record<Status, Status | null> = {
  'To Do': 'In Progress',
  'In Progress': 'Done',
  'Done': null,
};

const App = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [filter, setFilter] = useState<Status | 'All'>('All');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      deadline,
      status: 'To Do',
    };

    setTasks([...tasks, newTask]);
    setTitle('');
  };

  const changeStatus = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id !== id) return task;
      const next = nextStatus[task.status];
      return next ? { ...task, status: next } : task;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const isOverdue = (task: Task) => {
    if (task.status === 'Done') return false;
    const today = new Date().toISOString().split('T')[0];
    return task.deadline < today;
  };

  const filteredTasks = tasks.filter(task =>
    filter === 'All' ? true : task.status === filter
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">Менеджер задач</h1>

        <form onSubmit={addTask} className="bg-white p-4 rounded-lg mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Название задачи"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Добавить
            </button>
          </div>
      </form>

      <div className="flex gap-4 mb-4 bg-white p-3 rounded-lg">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="filter"
            value="All"
            checked={filter === 'All'}
            onChange={() => setFilter('All')}
            className="accent-blue-500"
          />
          <span>Все</span>
        </label>
        {STATUSES.map(status => (
          <label key={status} className="flex items-center gap-2">
            <input
              type="radio"
              name="filter"
              value={status}
              checked={filter === status}
              onChange={() => setFilter(status)}
              className="accent-blue-500"
            />
            <span>{status}</span>
          </label>
        ))}
      </div>

      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Нет задач</p>
        ) : (
          filteredTasks.map(task => {
            const overdue = isOverdue(task);
            const next = nextStatus[task.status];

            return (
              <div
                key={task.id}
                className={`bg-white p-4 rounded-lg flex items-center justify-between ${
                  overdue ? 'border-2 border-red-500' : 'border border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{task.title}</h3>
                  <p className="text-sm text-gray-500">
                    Дедлайн: {task.deadline} • {task.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  {next && (
                    <button
                      onClick={() => changeStatus(task.id)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                    >
                      → {next}
                    </button>
                  )}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      </div>
    </div>
  );
}

export default App
